package com.foodfusion.app.controller;

import com.foodfusion.app.entity.MenuItem;
import com.foodfusion.app.entity.Restaurant;
import com.foodfusion.app.entity.Review;
import com.foodfusion.app.service.RestaurantService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/search")
    public List<Restaurant> searchRestaurants(@RequestParam(required = false) String query) {
        return restaurantService.searchRestaurants(query);
    }

    @GetMapping("/{id}")
    public Restaurant getRestaurantById(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id);
    }

    @GetMapping("/{id}/menu")
    public List<MenuItem> getRestaurantMenu(@PathVariable Long id) {
        return restaurantService.getMenu(id);
    }

    @GetMapping("/{id}/reviews")
    public List<Review> getRestaurantReviews(@PathVariable Long id) {
        return restaurantService.getRestaurantReviews(id);
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> addReview(@PathVariable Long id,
                                       @RequestBody Map<String, Object> body,
                                       HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login first"));
        }

        try {
            Integer rating = (Integer) body.get("rating");
            String reviewText = (String) body.get("reviewText");
            String imageUrl = (String) body.get("imageUrl");
            Number menuItemIdVal = (Number) body.get("menuItemId");
            Long menuItemId = menuItemIdVal != null ? menuItemIdVal.longValue() : null;

            Review review = restaurantService.addReview(userId, id, menuItemId, rating, reviewText, imageUrl);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
