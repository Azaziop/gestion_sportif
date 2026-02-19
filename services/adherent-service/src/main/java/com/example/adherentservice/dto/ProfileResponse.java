package com.example.adherentservice.dto;

import com.example.adherentservice.model.Adherent;
import com.example.adherentservice.model.Subscription;

public class ProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Subscription currentSubscription;

    public ProfileResponse() {
    }

    public ProfileResponse(Adherent adherent, Subscription subscription) {
        this.id = adherent.getId();
        this.firstName = adherent.getFirstName();
        this.lastName = adherent.getLastName();
        this.email = adherent.getEmail();
        this.phoneNumber = adherent.getPhoneNumber();
        this.currentSubscription = subscription;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Subscription getCurrentSubscription() { return currentSubscription; }
    public void setCurrentSubscription(Subscription currentSubscription) { this.currentSubscription = currentSubscription; }
}
