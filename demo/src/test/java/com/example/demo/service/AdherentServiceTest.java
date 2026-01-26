package com.example.demo.service;

import com.example.demo.model.entity.Adherent;
import com.example.demo.model.enums.AdherentStatus;
import com.example.demo.repository.AdherentRepository;
import com.example.demo.repository.SubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour le service AdherentService
 */
@ExtendWith(MockitoExtension.class)
class AdherentServiceTest {
    
    @Mock
    private AdherentRepository adherentRepository;
    
    @Mock
    private SubscriptionRepository subscriptionRepository;
    
    @InjectMocks
    private AdherentService adherentService;
    
    private Adherent testAdherent;
    
    @BeforeEach
    void setUp() {
        testAdherent = new Adherent();
        testAdherent.setId(1L);
        testAdherent.setFirstName("John");
        testAdherent.setLastName("Doe");
        testAdherent.setEmail("john@example.com");
        testAdherent.setPhoneNumber("0123456789");
        testAdherent.setDateOfBirth(LocalDate.of(1990, 1, 1));
        testAdherent.setStatus(AdherentStatus.ACTIVE);
    }
    
    @Test
    void testCreateAdherent() {
        Adherent adherent = new Adherent();
        adherent.setFirstName("Jane");
        adherent.setLastName("Smith");
        adherent.setEmail("jane@example.com");
        
        when(adherentRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(adherentRepository.save(any(Adherent.class))).thenReturn(testAdherent);
        
        Adherent result = adherentService.createAdherent(adherent);
        
        assertNotNull(result);
        assertEquals(AdherentStatus.ACTIVE, result.getStatus());
        verify(adherentRepository).save(any(Adherent.class));
    }
    
    @Test
    void testCreateAdherentWithDuplicateEmail() {
        Adherent adherent = new Adherent();
        adherent.setEmail("john@example.com");
        
        when(adherentRepository.existsByEmail("john@example.com")).thenReturn(true);
        
        assertThrows(IllegalArgumentException.class, () -> {
            adherentService.createAdherent(adherent);
        });
        
        verify(adherentRepository, never()).save(any());
    }
    
    @Test
    void testGetAdherentById() {
        when(adherentRepository.findById(1L)).thenReturn(Optional.of(testAdherent));
        
        Adherent result = adherentService.getAdherentById(1L);
        
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(adherentRepository).findById(1L);
    }
    
    @Test
    void testGetAdherentByIdNotFound() {
        when(adherentRepository.findById(999L)).thenReturn(Optional.empty());
        
        assertThrows(IllegalArgumentException.class, () -> {
            adherentService.getAdherentById(999L);
        });
    }
    
    @Test
    void testSuspendAdherent() {
        when(adherentRepository.findById(1L)).thenReturn(Optional.of(testAdherent));
        when(adherentRepository.save(any(Adherent.class))).thenReturn(testAdherent);
        
        Adherent result = adherentService.suspendAdherent(1L, "Reason");
        
        assertNotNull(result);
        assertEquals(AdherentStatus.SUSPENDED, result.getStatus());
        assertEquals("Reason", result.getSuspendedReason());
    }
    
    @Test
    void testReactivateAdherent() {
        testAdherent.setStatus(AdherentStatus.SUSPENDED);
        
        when(adherentRepository.findById(1L)).thenReturn(Optional.of(testAdherent));
        when(adherentRepository.save(any(Adherent.class))).thenReturn(testAdherent);
        
        Adherent result = adherentService.reactivateAdherent(1L);
        
        assertNotNull(result);
        assertEquals(AdherentStatus.ACTIVE, result.getStatus());
    }
}
