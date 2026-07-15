package com.foodfusion.app.repository;

import com.foodfusion.app.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByRestaurantId(Long restaurantId);
    List<Order> findByDeliveryPartnerId(Long partnerId);
    List<Order> findByStatus(String status);
}
