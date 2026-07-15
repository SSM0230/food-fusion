package com.foodfusion.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String role; // CUSTOMER, OWNER, DELIVERY, ADMIN

    private LocalDate birthday;

    @Builder.Default
    private Integer loyaltyPoints = 0;

    @Builder.Default
    private String loyaltyLevel = "BRONZE"; // BRONZE, SILVER, GOLD, PLATINUM

    @Builder.Default
    private boolean active = true;
}
