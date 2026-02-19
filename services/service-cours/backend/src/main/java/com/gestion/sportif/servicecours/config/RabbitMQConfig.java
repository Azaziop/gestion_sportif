package com.gestion.sportif.servicecours.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration RabbitMQ pour la communication asynchrone entre microservices
 */
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.queue.cours.created}")
    private String coursCreatedQueue;

    @Value("${rabbitmq.queue.cours.updated}")
    private String coursUpdatedQueue;

    @Value("${rabbitmq.queue.cours.deleted}")
    private String coursDeletedQueue;

    @Value("${rabbitmq.exchange.cours}")
    private String coursExchange;

    /**
     * Queue pour les ÃƒÂ©vÃƒÂ©nements de crÃƒÂ©ation de cours
     */
    @Bean
    public Queue coursCreatedQueue() {
        return new Queue(coursCreatedQueue, true); // durable = true
    }

    /**
     * Queue pour les ÃƒÂ©vÃƒÂ©nements de mise ÃƒÂ  jour de cours
     */
    @Bean
    public Queue coursUpdatedQueue() {
        return new Queue(coursUpdatedQueue, true);
    }

    /**
     * Queue pour les ÃƒÂ©vÃƒÂ©nements de suppression de cours
     */
    @Bean
    public Queue coursDeletedQueue() {
        return new Queue(coursDeletedQueue, true);
    }

    /**
     * Exchange de type Topic pour router les messages
     */
    @Bean
    public TopicExchange coursExchange() {
        return new TopicExchange(coursExchange);
    }

    /**
     * Binding pour cours.created
     */
    @Bean
    public Binding coursCreatedBinding(Queue coursCreatedQueue, TopicExchange coursExchange) {
        return BindingBuilder
                .bind(coursCreatedQueue)
                .to(coursExchange)
                .with("cours.created");
    }

    /**
     * Binding pour cours.updated
     */
    @Bean
    public Binding coursUpdatedBinding(Queue coursUpdatedQueue, TopicExchange coursExchange) {
        return BindingBuilder
                .bind(coursUpdatedQueue)
                .to(coursExchange)
                .with("cours.updated");
    }

    /**
     * Binding pour cours.deleted
     */
    @Bean
    public Binding coursDeletedBinding(Queue coursDeletedQueue, TopicExchange coursExchange) {
        return BindingBuilder
                .bind(coursDeletedQueue)
                .to(coursExchange)
                .with("cours.deleted");
    }

    /**
     * Convertisseur de messages JSON
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * Template RabbitMQ avec convertisseur JSON
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}




