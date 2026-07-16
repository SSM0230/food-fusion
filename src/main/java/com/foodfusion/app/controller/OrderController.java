package com.foodfusion.app.controller;

import com.foodfusion.app.entity.Order;
import com.foodfusion.app.service.OrderService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> body, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login first"));
        }

        try {
            String addressLine = (String) body.get("addressLine");
            String paymentMethod = (String) body.get("paymentMethod");
            String couponCode = (String) body.get("couponCode");
            String packagingOption = (String) body.get("packagingOption"); // ECO or STANDARD
            Boolean isGift = (Boolean) body.get("isGift");
            if (isGift == null) isGift = false;
            String giftMessage = (String) body.get("giftMessage");

            String scheduledTimeStr = (String) body.get("scheduledTime");
            LocalDateTime scheduledTime = null;
            if (scheduledTimeStr != null && !scheduledTimeStr.trim().isEmpty()) {
                scheduledTime = LocalDateTime.parse(scheduledTimeStr);
            }

            String groupCode = (String) body.get("groupCode");

            Number deliveryTipVal = (Number) body.get("deliveryTip");
            Double deliveryTip = deliveryTipVal != null ? deliveryTipVal.doubleValue() : 0.0;

            Order order = orderService.placeOrder(
                    userId,
                    addressLine,
                    paymentMethod,
                    couponCode,
                    packagingOption,
                    isGift,
                    giftMessage,
                    scheduledTime,
                    groupCode,
                    deliveryTip
            );
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getOrderHistory(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login first"));
        }
        List<Order> history = orderService.getOrdersByUser(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            Order order = orderService.getOrderById(id);
            if (!order.getUser().getId().equals(userId) && 
                !"OWNER".equals(session.getAttribute("role")) && 
                !"DELIVERY".equals(session.getAttribute("role")) && 
                !"ADMIN".equals(session.getAttribute("role"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/track")
    public ResponseEntity<?> trackOrder(@PathVariable Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            Order order = orderService.getOrderById(id);
            if (!order.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Estimate delivery time (e.g. orderTime + deliveryTimeMin of restaurant)
            int prepAndDeliveryTime = order.getRestaurant().getDeliveryTimeMin();
            LocalDateTime estimatedTime = order.getOrderTime().plusMinutes(prepAndDeliveryTime);

            Map<String, Object> trackingData = Map.of(
                    "orderId", order.getId(),
                    "status", order.getStatus(),
                    "estimatedDeliveryTime", estimatedTime.toString().substring(11, 16),
                    "timeline", order.getTrackingTimeline(),
                    "deliveryPartner", order.getDeliveryPartner() != null ? order.getDeliveryPartner().getUsername() : "Assigning...",
                    "deliveryOtp", order.getDeliveryOtp() != null ? order.getDeliveryOtp() : ""
            );
            return ResponseEntity.ok(trackingData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reorder")
    public ResponseEntity<?> reorder(@PathVariable Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            orderService.reorder(id, userId);
            return ResponseEntity.ok(Map.of("message", "Items added back to your cart. View your cart to checkout!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            Order order = orderService.getOrderById(id);
            if (!order.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            if (!"PLACED".equals(order.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot cancel order that is already being prepared or out for delivery."));
            }

            orderService.updateOrderStatus(id, "CANCELLED", userId, "CUSTOMER");
            return ResponseEntity.ok(Map.of("message", "Order cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        try {
            byte[] pdfContents = orderService.generateInvoicePdf(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "invoice-" + id + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            return new ResponseEntity<>(pdfContents, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
