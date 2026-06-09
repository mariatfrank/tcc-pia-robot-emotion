package br.edu.piarobot.poc.repository;

import br.edu.piarobot.poc.domain.RobotSession;
import br.edu.piarobot.poc.domain.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RobotSessionRepository extends JpaRepository<RobotSession, UUID> {

    List<RobotSession> findAllByStatusOrderByStartedAtDesc(SessionStatus status);

    List<RobotSession> findAllByStatusOrderByFinishedAtDesc(SessionStatus status);

    List<RobotSession> findAllByOwnerEmailAndStatusOrderByStartedAtDesc(String ownerEmail, SessionStatus status);

    List<RobotSession> findAllByOwnerEmailAndStatusOrderByFinishedAtDesc(String ownerEmail, SessionStatus status);

    List<RobotSession> findAllByOwnerEmailIsNull();
}
