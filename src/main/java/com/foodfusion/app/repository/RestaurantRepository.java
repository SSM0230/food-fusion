package com.foodfusion.app.repository;

import com.foodfusion.app.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByNameContainingIgnoreCaseOrCuisineTypeContainingIgnoreCase(String name, String cuisine);
    List<Restaurant> findByOwnerId(Long ownerId);
}
