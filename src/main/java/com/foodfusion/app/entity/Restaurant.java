package com.foodfusion.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String cuisineType;

    private String imageUrl;

    @Column(nullable = false)
    private String openTime; // e.g. "09:00"

    @Column(nullable = false)
    private String closeTime; // e.g. "22:00"

    @Builder.Default
    private Integer deliveryTimeMin = 30;

    @Builder.Default
    private boolean open = true;

    @Builder.Default
    private Double rating = 5.0;

    private String coverImageUrl;

    @Builder.Default
    private Double distance = 1.5; // in km

    @Builder.Default
    private Double minOrderAmount = 99.0;

    @Builder.Default
    private Double deliveryFee = 40.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Builder.Default
    private String approvalStatus = "APPROVED"; // PENDING, APPROVED, REJECTED

    public String getCuisine() {
        return this.cuisineType;
    }
}
