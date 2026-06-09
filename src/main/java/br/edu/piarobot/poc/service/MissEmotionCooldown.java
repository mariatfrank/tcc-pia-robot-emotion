package br.edu.piarobot.poc.service;

import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Component
public class MissEmotionCooldown {

    private final TaskScheduler taskScheduler;
    private final SessionService sessionService;
    private final Map<UUID, ScheduledFuture<?>> pending = new ConcurrentHashMap<>();

    public MissEmotionCooldown(
            TaskScheduler taskScheduler,
            @Lazy SessionService sessionService
    ) {
        this.taskScheduler = taskScheduler;
        this.sessionService = sessionService;
    }

    public void cancel(UUID sessionId) {
        ScheduledFuture<?> f = pending.remove(sessionId);
        if (f != null) {
            f.cancel(false);
        }
    }

    public void scheduleReturnToNeutralAfterMiss(UUID sessionId) {
        pending.compute(sessionId, (id, previous) -> {
            if (previous != null) {
                previous.cancel(false);
            }
            ScheduledFuture<?> future = taskScheduler.schedule(
                    () -> {
                        pending.remove(sessionId);
                        sessionService.applyIdleAfterMissCooldown(sessionId);
                    },
                    Instant.now().plusSeconds(2)
            );
            return future;
        });
    }
}
