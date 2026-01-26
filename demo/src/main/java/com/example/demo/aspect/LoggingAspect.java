package com.example.demo.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.logging.Logger;

/**
 * Aspect AOP pour la journalisation des opérations du service
 */
@Aspect
@Component
public class LoggingAspect {
    
    private static final Logger log = Logger.getLogger(LoggingAspect.class.getName());
    
    /**
     * Pointcut pour toutes les méthodes du service
     */
    @Pointcut("execution(* com.example.demo.service.*.*(..))")
    public void serviceLayer() {}
    
    /**
     * Pointcut pour toutes les méthodes du contrôleur
     */
    @Pointcut("execution(* com.example.demo.controller.*.*(..))")
    public void controllerLayer() {}
    
    /**
     * Log les appels de méthode du service
     */
    @Before("serviceLayer()")
    public void logBeforeServiceCall(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();
        
        log.fine("Appel de " + className + "." + methodName + "() avec les arguments: " + Arrays.toString(args));
    }
    
    /**
     * Log les résultats et exceptions des méthodes du service
     */
    @Around("serviceLayer()")
    public Object logAroundServiceCall(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;
            
            log.fine(className + "." + methodName + "() exécuté avec succès en " + duration + " ms");
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.severe(className + "." + methodName + "() a levé une exception après " + duration + " ms: " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * Log les appels des endpoints REST
     */
    @Before("controllerLayer()")
    public void logBeforeRestCall(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        log.info("Requête HTTP reçue: " + className + "." + methodName);
    }
    
    /**
     * Log les réponses des endpoints REST
     */
    @AfterReturning(pointcut = "controllerLayer()", returning = "result")
    public void logAfterRestCall(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        log.info("Réponse HTTP retournée: " + className + "." + methodName);
    }
}
