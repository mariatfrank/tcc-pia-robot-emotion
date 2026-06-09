package br.edu.piarobot.poc.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "devices")
public class Device {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(length = 320)
    private String ownerEmail;

    private UUID sessionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected Device() {
    }

    public Device(String name, DeviceType type, String ownerEmail, UUID sessionId) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.type = type;
        this.ownerEmail = ownerEmail;
        this.sessionId = sessionId;
        this.status = DeviceStatus.ACTIVE;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public DeviceType getType() {
        return type;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public DeviceStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void updateSession(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public void deactivate() {
        this.status = DeviceStatus.INACTIVE;
    }
}
