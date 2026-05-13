package br.edu.piarobot.poc.repository;

import br.edu.piarobot.poc.domain.GameEventRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GameEventRecordRepository extends JpaRepository<GameEventRecord, UUID> {

    List<GameEventRecord> findAllBySessionIdOrderByCreatedAtAsc(UUID sessionId);
}
