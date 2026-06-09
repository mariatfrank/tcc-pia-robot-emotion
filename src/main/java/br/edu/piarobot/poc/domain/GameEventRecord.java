package br.edu.piarobot.poc.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "game_events")
public class GameEventRecord {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID sessionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameEventType type;

    @Column(nullable = false)
    private int points;

    @Column(nullable = false)
    private Instant createdAt;

    protected GameEventRecord() {
    }

    public GameEventRecord(UUID sessionId, GameEventType type, int points) {
        this.id = UUID.randomUUID();
        this.sessionId = sessionId;
        this.type = type;
        this.points = points;
    }

    @PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public GameEventType getType() {
        return type;
    }

    public int getPoints() {
        return points;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
