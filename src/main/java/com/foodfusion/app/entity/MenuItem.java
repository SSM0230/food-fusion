package com.foodfusion.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;

    @Column(nullable = false)
    private String category; // e.g. "Starters", "Mains", "Desserts", "Beverages"

    private boolean isVeg;

    @Builder.Default
    private Integer prepTimeMin = 15;

    // Customization choices: e.g. "Extra Cheese:1.50,Extra Sauce:0.50"
    private String customizableItems;

    @Builder.Default
    private boolean isAvailable = true;

    private Double originalPrice;
    private Integer discountPercent;
    private Integer calories;
    private String protein;
    private String spiceLevel; // "Mild", "Medium", "Hot"
    private boolean isBestSeller;
    private boolean isChefSpecial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;
}
