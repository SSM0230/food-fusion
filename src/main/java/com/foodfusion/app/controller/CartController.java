package com.foodfusion.app.controller;

import com.foodfusion.app.entity.CartItem;
import com.foodfusion.app.service.OrderService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<?> getCart(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login first"));
        }
        return ResponseEntity.ok(orderService.getCart(userId));
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login first"));
        }

        try {
            Number menuItemIdVal = (Number) body.get("menuItemId");
            Long menuItemId = menuItemIdVal.longValue();
            Integer quantity = (Integer) body.get("quantity");
            if (quantity == null) quantity = 1;
            String customizations = (String) body.get("customizations");

            CartItem cartItem = orderService.addToCart(userId, menuItemId, quantity, customizations);
            return ResponseEntity.ok(cartItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCartQuantity(@PathVariable Long id,
                                                @RequestBody Map<String, Integer> body,
                                                HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login first"));
        }

        try {
            Integer quantity = body.get("quantity");
            orderService.updateCartQuantity(id, quantity, userId);
            return ResponseEntity.ok(Map.of("message", "Cart item updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login first"));
        }

        try {
            orderService.removeFromCart(id, userId);
            return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login first"));
        }

        orderService.clearCart(userId);
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }
}
