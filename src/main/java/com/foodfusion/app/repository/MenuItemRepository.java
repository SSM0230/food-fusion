package com.foodfusion.app.repository;

import com.foodfusion.app.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(String name, String category);
}
