package com.example.demo.batch;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.logging.Logger;

/**
 * Scheduler pour exécuter automatiquement le job de traitement des abonnements expirés
 * S'exécute tous les jours à minuit
 */
@Component
public class SubscriptionExpirationScheduler {
    
    private static final Logger log = Logger.getLogger(SubscriptionExpirationScheduler.class.getName());
    
    private final JobLauncher jobLauncher;
    private final Job processExpiredSubscriptionsJob;
    
    public SubscriptionExpirationScheduler(JobLauncher jobLauncher, 
                                          Job processExpiredSubscriptionsJob) {
        this.jobLauncher = jobLauncher;
        this.processExpiredSubscriptionsJob = processExpiredSubscriptionsJob;
    }
    
    /**
     * Exécute le job tous les jours à minuit (0h00)
     * Cron expression: seconde minute heure jour mois jour-semaine
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduleExpiredSubscriptionsJob() {
        try {
            log.info("🔄 Lancement automatique du job de traitement des abonnements expirés");
            
            JobParameters params = new JobParametersBuilder()
                .addLong("time", System.currentTimeMillis())
                .toJobParameters();
            
            jobLauncher.run(processExpiredSubscriptionsJob, params);
            
            log.info("✅ Job de traitement des abonnements expirés terminé avec succès");
        } catch (Exception e) {
            log.severe("❌ Erreur lors de l'exécution du job: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
