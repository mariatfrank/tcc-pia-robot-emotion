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

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class SessionService {

    private final RobotSessionRepository sessionRepository;
    private final GameEventRecordRepository eventRepository;
    private final GameEventPublisher gameEventPublisher;
    private final EmotionPublisher emotionPublisher;
    private final EmotionEngine emotionEngine;

    public SessionService(
            RobotSessionRepository sessionRepository,
            GameEventRecordRepository eventRepository,
            GameEventPublisher gameEventPublisher,
            EmotionPublisher emotionPublisher,
            EmotionEngine emotionEngine
    ) {
        this.sessionRepository = sessionRepository;
        this.eventRepository = eventRepository;
        this.gameEventPublisher = gameEventPublisher;
        this.emotionPublisher = emotionPublisher;
        this.emotionEngine = emotionEngine;
    }

    @Transactional
    public RobotSession create(CreateSessionRequest request) {
        RobotSession session = sessionRepository.save(new RobotSession(request.gameCode(), request.difficulty()));
        publishEmotion(session, "Sessão criada");
        return session;
    }

    @Transactional(readOnly = true)
    public List<RobotSession> listActive() {
        return sessionRepository.findAllByStatusOrderByStartedAtDesc(SessionStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public RobotSession get(UUID id) {
        return findSession(id);
    }

    @Transactional(readOnly = true)
    public List<GameEventRecord> listEvents(UUID sessionId) {
        findSession(sessionId);
        return eventRepository.findAllBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public GameEventRecord receiveGameEvent(UUID sessionId, GameEventRequest request) {
        RobotSession session = findSession(sessionId);
        if (session.getStatus() == SessionStatus.FINISHED) {
            throw new InvalidSessionStateException("Sessão já finalizada: " + sessionId);
        }

        GameEventRecord event = eventRepository.save(new GameEventRecord(session.getId(), request.type(), request.points()));
        gameEventPublisher.publish(new GameEventMessage(
                event.getId(),
                event.getSessionId(),
                event.getType(),
                event.getPoints(),
                event.getCreatedAt()
        ));
        return event;
    }

    @Transactional
    public RobotSession processGameEvent(GameEventMessage message) {
        RobotSession session = findSession(message.sessionId());
        EmotionType emotion = emotionEngine.decide(session, message.type());

        if (message.type() == GameEventType.HIT) {
            session.registerHit(message.points(), emotion);
        } else if (message.type() == GameEventType.MISS) {
            session.registerMiss(emotion);
        } else if (message.type() == GameEventType.GAME_STARTED) {
            session.setEmotion(emotion);
        } else if (message.type() == GameEventType.GAME_FINISHED) {
            session.finish(emotion);
        }

        publishEmotion(session, "Evento processado: " + message.type());
        return session;
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
