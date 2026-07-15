package com.foodfusion.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    private String description;

    @Builder.Default
    private Double discountAmount = 0.0;

    @Builder.Default
    private Double discountPercent = 0.0;

    @Builder.Default
    private Double minOrderValue = 0.0;

    private LocalDate expiryDate;

    @Builder.Default
    private boolean active = true;
}
