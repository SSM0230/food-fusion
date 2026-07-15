package com.foodfusion.app.repository;

import com.foodfusion.app.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRestaurantId(Long restaurantId);
    List<Review> findByMenuItemId(Long menuItemId);
}
