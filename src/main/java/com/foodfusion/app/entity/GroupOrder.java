package com.foodfusion.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "group_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String groupCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Builder.Default
    private boolean active = true;
}
