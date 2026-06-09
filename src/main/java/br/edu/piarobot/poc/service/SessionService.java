package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.domain.EmotionType;
import br.edu.piarobot.poc.domain.GameEventRecord;
import br.edu.piarobot.poc.domain.GameEventType;
import br.edu.piarobot.poc.domain.RobotSession;
import br.edu.piarobot.poc.domain.SessionStatus;
import br.edu.piarobot.poc.dto.CreateSessionRequest;
import br.edu.piarobot.poc.dto.GameEventRequest;
import br.edu.piarobot.poc.messaging.EmotionUpdateMessage;
import br.edu.piarobot.poc.messaging.GameEventMessage;
import br.edu.piarobot.poc.repository.GameEventRecordRepository;
import br.edu.piarobot.poc.repository.RobotSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SessionService {

    private final RobotSessionRepository sessionRepository;
    private final GameEventRecordRepository eventRepository;
    private final EmotionPublisher emotionPublisher;
    private final EmotionEngine emotionEngine;
    private final MissEmotionCooldown missEmotionCooldown;
    private final DeviceService deviceService;

    public SessionService(
            RobotSessionRepository sessionRepository,
            GameEventRecordRepository eventRepository,
            EmotionPublisher emotionPublisher,
            EmotionEngine emotionEngine,
            MissEmotionCooldown missEmotionCooldown,
            DeviceService deviceService
    ) {
        this.sessionRepository = sessionRepository;
        this.eventRepository = eventRepository;
        this.emotionPublisher = emotionPublisher;
        this.emotionEngine = emotionEngine;
        this.missEmotionCooldown = missEmotionCooldown;
        this.deviceService = deviceService;
    }

    @Transactional
    public RobotSession create(CreateSessionRequest request, String ownerEmail) {
        String owner = normalizeOwner(ownerEmail);
        if (owner != null) {
            sessionRepository.findAllByOwnerEmailAndStatusOrderByStartedAtDesc(owner, SessionStatus.ACTIVE)
                    .forEach(session -> session.finish(EmotionType.IDLE));
        }
        RobotSession session = sessionRepository.save(
                new RobotSession(request.gameCode(), request.difficulty(), owner)
        );
        publishEmotion(session, "Sessão criada");
        return session;
    }

    @Transactional(readOnly = true)
    public Optional<RobotSession> findCurrentLiveForOwner(String ownerEmail) {
        String owner = normalizeOwner(ownerEmail);
        List<RobotSession> active = owner != null
                ? sessionRepository.findAllByOwnerEmailAndStatusOrderByStartedAtDesc(owner, SessionStatus.ACTIVE)
                : sessionRepository.findAllByStatusOrderByStartedAtDesc(SessionStatus.ACTIVE);
        if (active.isEmpty()) {
            return Optional.empty();
        }
        Optional<RobotSession> playing = active.stream()
                .filter(RobotSession::isPlayStarted)
                .findFirst();
        if (playing.isPresent()) {
            return playing;
        }
        return Optional.of(active.getFirst());
    }

    @Transactional
    public List<RobotSession> listActive(String ownerEmail) {
        String owner = normalizeOwner(ownerEmail);
        if (owner != null) {
            claimUnownedSessions(owner);
            return sessionRepository.findAllByOwnerEmailAndStatusOrderByStartedAtDesc(owner, SessionStatus.ACTIVE);
        }
        return sessionRepository.findAllByStatusOrderByStartedAtDesc(SessionStatus.ACTIVE);
    }

    @Transactional
    public List<RobotSession> listFinished(String ownerEmail) {
        String owner = normalizeOwner(ownerEmail);
        if (owner != null) {
            claimUnownedSessions(owner);
            return sessionRepository.findAllByStatusOrderByFinishedAtDesc(SessionStatus.FINISHED);
        }
        return sessionRepository.findAllByStatusOrderByFinishedAtDesc(SessionStatus.FINISHED);
    }

    @Transactional(readOnly = true)
    public RobotSession get(UUID id) {
        return findSession(id);
    }

    @Transactional
    public int claimUnownedSessions(String ownerEmail) {
        String owner = normalizeOwner(ownerEmail);
        if (owner == null) {
            return 0;
        }
        List<RobotSession> sessions = sessionRepository.findAllByOwnerEmailIsNull();
        sessions.forEach(session -> session.assignOwner(owner));
        return sessions.size();
    }

    @Transactional(readOnly = true)
    public List<GameEventRecord> listEvents(UUID sessionId) {
        findSession(sessionId);
        return eventRepository.findAllBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public GameEventRecord receiveGameEvent(UUID sessionId, GameEventRequest request, String ownerEmail) {
        RobotSession session = findSession(sessionId);
        if (session.getStatus() == SessionStatus.FINISHED) {
            throw new InvalidSessionStateException("Sessão já finalizada: " + sessionId);
        }
        assignOwnerIfMissing(session, ownerEmail);

        GameEventRecord event = eventRepository.save(
                new GameEventRecord(session.getId(), request.type(), request.points())
        );
        GameEventMessage message = new GameEventMessage(
                event.getId(),
                event.getSessionId(),
                event.getType(),
                event.getPoints(),
                event.getCreatedAt()
        );
        processGameEvent(message, ownerEmail);
        return event;
    }

    @Transactional
    public RobotSession processGameEvent(GameEventMessage message) {
        return processGameEvent(message, null);
    }

    @Transactional
    public RobotSession processGameEvent(GameEventMessage message, String ownerEmail) {
        if (message.type() != GameEventType.MISS) {
            missEmotionCooldown.cancel(message.sessionId());
        }
        RobotSession session = findSession(message.sessionId());
        EmotionType emotion = emotionEngine.decide(session, message.type());

        if (message.type() == GameEventType.HIT) {
            session.registerHit(message.points(), emotion);
        } else if (message.type() == GameEventType.MISS) {
            session.registerMiss(emotion);
        } else if (message.type() == GameEventType.GAME_STARTED) {
            session.markPlayStarted();
            session.setEmotion(emotion);
        } else if (message.type() == GameEventType.GAME_FINISHED) {
            session.finish(emotion);
        }

        publishEmotion(session, "Evento processado: " + message.type());
        syncOwnerDevices(session, ownerEmail);
        if (message.type() == GameEventType.MISS) {
            missEmotionCooldown.scheduleReturnToNeutralAfterMiss(message.sessionId());
        }
        return session;
    }

    @Transactional
    public void applyIdleAfterMissCooldown(UUID sessionId) {
        RobotSession session = sessionRepository.findById(sessionId).orElse(null);
        if (session == null || session.getStatus() == SessionStatus.FINISHED) {
            return;
        }
        if (session.getCurrentEmotion() != EmotionType.SAD) {
            return;
        }
        session.setEmotion(EmotionType.IDLE);
        publishEmotion(session, "Neutro após erro");
        syncOwnerDevices(session, session.getOwnerEmail());
    }

    @Transactional
    public RobotSession setManualEmotion(UUID sessionId, EmotionType emotion) {
        RobotSession session = findSession(sessionId);
        session.setEmotion(emotion);
        publishEmotion(session, "Emoção definida manualmente");
        return session;
    }

    private RobotSession findSession(UUID id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sessão não encontrada: " + id));
    }

    private String normalizeOwner(String ownerEmail) {
        if (!StringUtils.hasText(ownerEmail)) {
            return null;
        }
        return ownerEmail.trim().toLowerCase();
    }

    private void assignOwnerIfMissing(RobotSession session, String ownerEmail) {
        if (StringUtils.hasText(session.getOwnerEmail())) {
            return;
        }
        String owner = normalizeOwner(ownerEmail);
        if (owner != null) {
            session.assignOwner(owner);
        }
    }

    private void syncOwnerDevices(RobotSession session, String ownerEmail) {
        String owner = normalizeOwner(session.getOwnerEmail());
        if (owner == null) {
            owner = normalizeOwner(ownerEmail);
        }
        if (owner == null) {
            return;
        }
        deviceService.syncSessionForOwner(owner, session.getId());
    }

    private void publishEmotion(RobotSession session, String reason) {
        emotionPublisher.publish(new EmotionUpdateMessage(
                session.getId(),
                session.getCurrentEmotion(),
                session.getScore(),
                session.getHits(),
                session.getMisses(),
                Instant.now(),
                reason
        ));
    }
}
