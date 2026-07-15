package com.foodfusion.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false)
    private String deliveryAddress;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PLACED"; // PLACED, PREPARING, PICKED_UP, ON_THE_WAY, DELIVERED, CANCELLED

    @Column(nullable = false)
    private LocalDateTime orderTime;

    private LocalDateTime scheduledTime; // null for immediate, otherwise target time

    @Column(nullable = false)
    private Double totalAmount;

    @Builder.Default
    private Double discountAmount = 0.0;

    @Builder.Default
    private Double deliveryFee = 40.0;

    @Builder.Default
    private Double platformFee = 10.0;

    @Builder.Default
    private Double tax = 0.0;

    @Builder.Default
    private String packagingOption = "STANDARD"; // STANDARD, ECO

    private boolean isGift;

    private String giftMessage;

    // Track status timeline, e.g., "Placed at 20:25|Preparing at 20:30"
    private String trackingTimeline;

    @Column(nullable = false)
    private String paymentMethod; // COD, UPI, CARD

    private boolean paid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_partner_id")
    private User deliveryPartner;

    private Integer deliveryOtp;

    @Builder.Default
    private Double deliveryTip = 0.0;
}
