package com.foodfusion.app.controller;

import com.foodfusion.app.entity.Coupon;
import com.foodfusion.app.entity.Order;
import com.foodfusion.app.entity.Restaurant;
import com.foodfusion.app.entity.User;
import com.foodfusion.app.repository.CouponRepository;
import com.foodfusion.app.repository.OrderItemRepository;
import com.foodfusion.app.repository.OrderRepository;
import com.foodfusion.app.repository.RestaurantRepository;
import com.foodfusion.app.repository.UserRepository;
import com.foodfusion.app.service.OrderService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderService orderService;

    private ResponseEntity<?> checkAdminRole(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");
        if (userId == null || !"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access restricted to administrators."));
        }
        return null;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/restaurants")
    public ResponseEntity<?> getAllRestaurants(HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        return ResponseEntity.ok(restaurantRepository.findAll());
    }

    @GetMapping("/coupons")
    public ResponseEntity<?> getCoupons(HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        return ResponseEntity.ok(couponRepository.findAll());
    }

    @PostMapping("/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody Map<String, Object> body, HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        try {
            String code = (String) body.get("code");
            String description = (String) body.get("description");

            Number discAmtVal = (Number) body.get("discountAmount");
            Double discountAmount = discAmtVal != null ? discAmtVal.doubleValue() : 0.0;

            Number discPctVal = (Number) body.get("discountPercent");
            Double discountPercent = discPctVal != null ? discPctVal.doubleValue() : 0.0;

            Number minOrderVal = (Number) body.get("minOrderValue");
            Double minOrderValue = minOrderVal != null ? minOrderVal.doubleValue() : 0.0;

            Integer durationDays = (Integer) body.get("durationDays");
            if (durationDays == null) durationDays = 7;

            Coupon c = orderService.createCoupon(code, description, discountAmount, discountPercent, minOrderValue, durationDays);
            return ResponseEntity.ok(c);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getPlatformReport(HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        List<User> users = userRepository.findAll();
        List<Restaurant> restaurants = restaurantRepository.findAll();
        List<Order> orders = orderRepository.findAll();

        double totalSales = 0.0;
        double totalPlatformFees = 0.0;
        int completedCount = 0;
        Map<String, Double> cuisineSales = new HashMap<>();

        for (Order o : orders) {
            if ("DELIVERED".equals(o.getStatus())) {
                totalSales += o.getTotalAmount();
                totalPlatformFees += o.getPlatformFee();
                completedCount++;

                String cuisine = o.getRestaurant().getCuisineType();
                cuisineSales.put(cuisine, cuisineSales.getOrDefault(cuisine, 0.0) + o.getTotalAmount());
            }
        }

        Map<String, Integer> dishSales = new HashMap<>();
        List<com.foodfusion.app.entity.OrderItem> allItems = orderItemRepository.findAll();
        for (com.foodfusion.app.entity.OrderItem item : allItems) {
            if ("DELIVERED".equals(item.getOrder().getStatus())) {
                String dishName = item.getMenuItem().getName();
                dishSales.put(dishName, dishSales.getOrDefault(dishName, 0) + item.getQuantity());
            }
        }

        Map<String, Object> stats = Map.of(
                "totalUsers", users.size(),
                "totalRestaurants", restaurants.size(),
                "totalOrders", orders.size(),
                "completedOrders", completedCount,
                "totalPlatformRevenue", Math.round(totalPlatformFees * 100.0) / 100.0,
                "totalSalesAmount", Math.round(totalSales * 100.0) / 100.0,
                "cuisineSales", cuisineSales,
                "dishSales", dishSales
        );

        return ResponseEntity.ok(stats);
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id, HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body, HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        String newRole = body.get("role");
        if (newRole == null || (!"CUSTOMER".equals(newRole) && !"OWNER".equals(newRole) && !"DELIVERY".equals(newRole) && !"ADMIN".equals(newRole))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role specified."));
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole.toUpperCase());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/restaurants/{id}/approve")
    public ResponseEntity<?> approveRestaurant(@PathVariable Long id, @RequestBody Map<String, String> body, HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        String action = body.get("action"); // APPROVED or REJECTED
        if (action == null || (!"APPROVED".equals(action) && !"REJECTED".equals(action))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid action specified."));
        }

        Restaurant rest = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        rest.setApprovalStatus(action);
        return ResponseEntity.ok(restaurantRepository.save(rest));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        return ResponseEntity.ok(orderRepository.findAll());
    }

    @PutMapping("/orders/{orderId}/dispatch")
    public ResponseEntity<?> dispatchOrder(@PathVariable Long orderId, @RequestBody Map<String, Long> body, HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        Long driverId = body.get("driverId");
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        if (!"DELIVERY".equals(driver.getRole())) {
            throw new RuntimeException("Selected user is not a delivery partner");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setDeliveryPartner(driver);
        order.setStatus("PREPARING");

        String currentTime = java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
        String timeline = order.getTrackingTimeline();
        if (timeline == null || timeline.trim().isEmpty()) {
            timeline = "Placed (" + currentTime + ")";
        }
        order.setTrackingTimeline(timeline + " | Delivery Partner Assigned (" + currentTime + ")");

        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PutMapping("/coupons/{id}/toggle")
    public ResponseEntity<?> toggleCoupon(@PathVariable Long id, HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        coupon.setActive(!coupon.isActive());
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id, HttpSession session) {
        ResponseEntity<?> authCheck = checkAdminRole(session);
        if (authCheck != null) return authCheck;

        couponRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Coupon deleted"));
    }
}
