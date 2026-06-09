package br.edu.piarobot.poc.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "robot_sessions")
public class RobotSession {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String gameCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmotionType currentEmotion;

    @Column(length = 320)
    private String ownerEmail;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private int hits;

    @Column(nullable = false)
    private int misses;

    @Column(nullable = false)
    @ColumnDefault("false")
    private boolean playStarted = false;

    @Column(nullable = false)
    private Instant startedAt;

    private Instant finishedAt;

    protected RobotSession() {
    }

    public RobotSession(String gameCode, Difficulty difficulty) {
        this(gameCode, difficulty, null);
    }

    public RobotSession(String gameCode, Difficulty difficulty, String ownerEmail) {
        this.id = UUID.randomUUID();
        this.gameCode = gameCode;
        this.difficulty = difficulty;
        this.ownerEmail = ownerEmail;
        this.status = SessionStatus.ACTIVE;
        this.currentEmotion = EmotionType.IDLE;
    }

    @PrePersist
    void prePersist() {
        this.startedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getGameCode() {
        return gameCode;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public EmotionType getCurrentEmotion() {
        return currentEmotion;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void assignOwner(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public int getScore() {
        return score;
    }

    public int getHits() {
        return hits;
    }

    public int getMisses() {
        return misses;
    }

    public boolean isPlayStarted() {
        return playStarted;
    }

    public void markPlayStarted() {
        this.playStarted = true;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public void registerHit(int points, EmotionType emotion) {
        this.hits++;
        this.score += Math.max(points, 0);
        this.currentEmotion = emotion;
    }

    public void registerMiss(EmotionType emotion) {
        this.misses++;
        this.currentEmotion = emotion;
    }

    public void setEmotion(EmotionType emotion) {
        this.currentEmotion = emotion;
    }

    public void finish(EmotionType emotion) {
        this.status = SessionStatus.FINISHED;
        this.currentEmotion = emotion;
        this.finishedAt = Instant.now();
    }
}

