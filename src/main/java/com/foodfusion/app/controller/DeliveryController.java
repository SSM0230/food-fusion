package com.foodfusion.app.controller;

import com.foodfusion.app.entity.Order;
import com.foodfusion.app.repository.OrderRepository;
import com.foodfusion.app.service.OrderService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    private ResponseEntity<?> checkDeliveryRole(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");
        if (userId == null || (!"DELIVERY".equals(role) && !"ADMIN".equals(role))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access restricted to delivery partners."));
        }
        return null;
    }

    @GetMapping("/orders/available")
    public ResponseEntity<?> getAvailableOrders(@RequestParam(required = false) String vehicle, HttpSession session) {
        ResponseEntity<?> authCheck = checkDeliveryRole(session);
        if (authCheck != null) return authCheck;

        // Fetch orders in PLACED or PREPARING state that don't have a delivery partner assigned yet
        List<Order> placed = orderRepository.findByStatus("PLACED");
        List<Order> preparing = orderRepository.findByStatus("PREPARING");

        placed.addAll(preparing);

        final double maxDistance;
        if ("BICYCLE".equalsIgnoreCase(vehicle)) {
            maxDistance = 2.0;
        } else if ("SCOOTER".equalsIgnoreCase(vehicle)) {
            maxDistance = 5.0;
        } else {
            maxDistance = 10.0; // default/MOTORBIKE
        }

        List<Order> available = placed.stream()
                .filter(o -> o.getDeliveryPartner() == null)
                .filter(o -> o.getRestaurant().getDistance() == null || o.getRestaurant().getDistance() <= maxDistance)
                .collect(Collectors.toList());

        return ResponseEntity.ok(available);
    }

    @PostMapping("/orders/{id}/accept")
    public ResponseEntity<?> acceptOrder(@PathVariable Long id, HttpSession session) {
        ResponseEntity<?> authCheck = checkDeliveryRole(session);
        if (authCheck != null) return authCheck;

        Long partnerId = (Long) session.getAttribute("userId");
        try {
            Order order = orderService.assignDeliveryPartner(id, partnerId);
            orderService.updateOrderStatus(id, "PREPARING", partnerId, "DELIVERY");
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody Map<String, String> body,
                                          HttpSession session) {
        ResponseEntity<?> authCheck = checkDeliveryRole(session);
        if (authCheck != null) return authCheck;

        Long partnerId = (Long) session.getAttribute("userId");
        try {
            String status = body.get("status"); // PICKED_UP, ON_THE_WAY, DELIVERED
            if ("DELIVERED".equals(status)) {
                String otp = body.get("otp");
                if (otp == null || otp.trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Secure Delivery OTP is required to complete this order."));
                }
                Order order = orderRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Order not found"));
                if (order.getDeliveryOtp() != null && !String.valueOf(order.getDeliveryOtp()).equals(otp.trim())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid Delivery OTP. Please ask the customer."));
                }
            }
            Order order = orderService.updateOrderStatus(id, status, partnerId, "DELIVERY");
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getEarnings(HttpSession session) {
        ResponseEntity<?> authCheck = checkDeliveryRole(session);
        if (authCheck != null) return authCheck;

        Long partnerId = (Long) session.getAttribute("userId");
        List<Order> myDeliveries = orderService.getOrdersByPartner(partnerId);

        double totalEarnings = 0.0;
        int completedCount = 0;

        for (Order o : myDeliveries) {
            if ("DELIVERED".equals(o.getStatus())) {
                // Delivery Partner gets the deliveryFee + deliveryTip as earnings
                totalEarnings += o.getDeliveryFee() + (o.getDeliveryTip() != null ? o.getDeliveryTip() : 0.0);
                completedCount++;
            }
        }

        // Mock availability toggle state inside HttpSession
        Boolean available = (Boolean) session.getAttribute("delivery_available");
        if (available == null) available = true;

        Map<String, Object> dashboard = Map.of(
                "totalEarnings", Math.round(totalEarnings * 100.0) / 100.0,
                "completedDeliveries", completedCount,
                "myOrders", myDeliveries,
                "available", available
        );
        return ResponseEntity.ok(dashboard);
    }

    @PutMapping("/toggle-availability")
    public ResponseEntity<?> toggleAvailability(HttpSession session) {
        ResponseEntity<?> authCheck = checkDeliveryRole(session);
        if (authCheck != null) return authCheck;

        Boolean current = (Boolean) session.getAttribute("delivery_available");
        if (current == null) current = true;
        session.setAttribute("delivery_available", !current);

        return ResponseEntity.ok(Map.of("available", !current));
    }
}
