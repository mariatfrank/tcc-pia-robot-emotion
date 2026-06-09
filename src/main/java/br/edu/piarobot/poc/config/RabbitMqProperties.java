package br.edu.piarobot.poc.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "pia.rabbit")
public record RabbitMqProperties(
        String gameEventsExchange,
        String gameEventsQueue,
        String gameEventsRoutingKey,
        String emotionExchange,
        String emotionQueue,
        String emotionRoutingKey
) {
}
