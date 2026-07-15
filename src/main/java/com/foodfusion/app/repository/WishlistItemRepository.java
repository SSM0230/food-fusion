package com.foodfusion.app.repository;

import com.foodfusion.app.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserId(Long userId);
    Optional<WishlistItem> findByUserIdAndRestaurantId(Long userId, Long restaurantId);
    Optional<WishlistItem> findByUserIdAndMenuItemId(Long userId, Long menuItemId);
}
