package br.edu.piarobot.poc.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(RabbitMqProperties.class)
public class RabbitMqConfig {

    @Bean
    DirectExchange gameEventsExchange(RabbitMqProperties properties) {
        return new DirectExchange(properties.gameEventsExchange(), true, false);
    }

    @Bean
    Queue gameEventsQueue(RabbitMqProperties properties) {
        return new Queue(properties.gameEventsQueue(), true);
    }

    @Bean
    Binding gameEventsBinding(Queue gameEventsQueue, DirectExchange gameEventsExchange, RabbitMqProperties properties) {
        return BindingBuilder.bind(gameEventsQueue)
                .to(gameEventsExchange)
                .with(properties.gameEventsRoutingKey());
    }

    @Bean
    DirectExchange emotionExchange(RabbitMqProperties properties) {
        return new DirectExchange(properties.emotionExchange(), true, false);
    }

    @Bean
    Queue emotionQueue(RabbitMqProperties properties) {
        return new Queue(properties.emotionQueue(), true);
    }

    @Bean
    Binding emotionBinding(Queue emotionQueue, DirectExchange emotionExchange, RabbitMqProperties properties) {
        return BindingBuilder.bind(emotionQueue)
                .to(emotionExchange)
                .with(properties.emotionRoutingKey());
    }

    @Bean
    MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }

    @Bean
    SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter
    ) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        return factory;
    }
}
