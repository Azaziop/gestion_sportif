package com.example.demo.batch;

import com.example.demo.service.AdherentService;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import java.util.logging.Logger;

/**
 * Configuration des tâches Batch pour le traitement des abonnements expirés
 */
@Configuration
public class BatchConfig {
    
    private static final Logger log = Logger.getLogger(BatchConfig.class.getName());
    
    private final AdherentService adherentService;
    
    public BatchConfig(AdherentService adherentService) {
        this.adherentService = adherentService;
    }
    
    /**
     * Tasklet pour traiter les abonnements expirés
     */
    @Bean
    public Tasklet processExpiredSubscriptionsTasklet() {
        return (contribution, chunkContext) -> {
            log.info("Démarrage du traitement des abonnements expirés");
            adherentService.processExpiredSubscriptions();
            log.info("Traitement des abonnements expirés terminé");
            return RepeatStatus.FINISHED;
        };
    }
    
    /**
     * Step pour traiter les abonnements expirés
     */
    @Bean
    public Step processExpiredSubscriptionsStep(
            JobRepository jobRepository,
            PlatformTransactionManager transactionManager) {
        return new StepBuilder("processExpiredSubscriptionsStep", jobRepository)
            .tasklet(processExpiredSubscriptionsTasklet(), transactionManager)
            .build();
    }
    
    /**
     * Job pour traiter les abonnements expirés
     * À exécuter quotidiennement via un scheduler
     */
    @Bean
    public Job processExpiredSubscriptionsJob(
            JobRepository jobRepository,
            Step processExpiredSubscriptionsStep) {
        return new JobBuilder("processExpiredSubscriptionsJob", jobRepository)
            .start(processExpiredSubscriptionsStep)
            .build();
    }
}
