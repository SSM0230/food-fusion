package com.foodfusion.app.controller;

import com.foodfusion.app.entity.MenuItem;
import com.foodfusion.app.entity.Order;
import com.foodfusion.app.entity.OrderItem;
import com.foodfusion.app.entity.Restaurant;
import com.foodfusion.app.entity.Review;
import com.foodfusion.app.repository.OrderItemRepository;
import com.foodfusion.app.service.OrderService;
import com.foodfusion.app.service.RestaurantService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/owner")
public class OwnerController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderItemRepository orderItemRepository;

    private ResponseEntity<?> checkOwnerRole(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");
        if (userId == null || (!"OWNER".equals(role) && !"ADMIN".equals(role))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access restricted to restaurant owners."));
        }
        return null;
    }

    @GetMapping("/restaurants")
    public ResponseEntity<?> getMyRestaurants(HttpSession session) {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) return authCheck;

        Long ownerId = (Long) session.getAttribute("userId");
        return ResponseEntity.ok(restaurantService.getRestaurantsByOwner(ownerId));
    }

    @PostMapping("/restaurants")
    public ResponseEntity<?> registerRestaurant(@RequestBody Map<String, String> body, HttpSession session) {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) return authCheck;

        Long ownerId = (Long) session.getAttribute("userId");
        try {
            Restaurant r = restaurantService.registerRestaurant(
                    body.get("name"),
                    body.get("description"),
                    body.get("cuisineType"),
                    body.get("imageUrl"),
                    body.get("openTime"),
                    body.get("closeTime"),
                    ownerId
            );
            return ResponseEntity.ok(r);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/restaurants/{id}/toggle")
    public ResponseEntity<?> toggleRestaurant(@PathVariable Long id, HttpSession session) {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) return authCheck;

        Long ownerId = (Long) session.getAttribute("userId");
        try {
            Restaurant r = restaurantService.toggleRestaurantStatus(id, ownerId);
            return ResponseEntity.ok(r);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id, HttpSession session) {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) return authCheck;

        Long ownerId = (Long) session.getAttribute("userId");
        try {
            restaurantService.deleteRestaurant(id, ownerId);
            return ResponseEntity.ok(Map.of("message", "Restaurant deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Menu Management ---
    @PostMapping("/restaurants/{restaurantId}/menu")
    public ResponseEntity<?> addMenuItem(@PathVariable Long restaurantId,
                                         @RequestBody MenuItem item,
                                         HttpSession session) {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) return authCheck;

        Long ownerId = (Long) session.getAttribute("userId");
        try {
            Integer discountPercent = item.getDiscountPercent();
            MenuItem newIt = restaurantService.addMenuItem(
                    restaurantId,
                    item.getName(),
                    item.getDescription(),
                    item.getPrice(),
                    item.getImageUrl(),
                    item.getCategory(),
                    item.isVeg(),
                    item.getCustomizableItems(),
                    discountPercent,
                    ownerId
            );
            return ResponseEntity.ok(newIt);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/menu/{itemId}")
    public ResponseEntity<?> editMenuItem(@PathVariable Long itemId,
                                          @RequestBody MenuItem item,
                                          HttpSession session) {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) return authCheck;

        Long ownerId = (Long) session.getAttribute("userId");
        try {
            Integer discountPercent = item.getDiscountPercent();
            MenuItem edited = restaurantService.editMenuItem(
                    itemId,
                    item.getName(),
                    item.getDescription(),
                    item.getPrice(),
                    item.getImageUrl(),
                    item.getCategory(),
                    item.isVeg(),
                    item.getCustomizableItems(),
                    item.isAvailable(),
                    discountPercent,
                    ownerId
            );
            return ResponseEntity.ok(edited);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/menu/{itemId}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long itemId, HttpSession session) {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) return authCheck;

        Long ownerId = (Long) session.getAttribute("userId");
        try {
            restaurantService.deleteMenuItem(itemId, ownerId);
            return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Order Processing ---
    @GetMapping("/restaurants/{restaurantId}/orders")
    public ResponseEntity<?> getRestaurantOrders(@PathVariable Long restaurantId, HttpSession session) {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) return authCheck;

        Restaurant rest = restaurantService.getRestaurantById(restaurantId);
        Long ownerId = (Long) session.getAttribute("userId");
        if (!rest.getOwner().getId().equals(ownerId) && !"ADMIN".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(orderService.getOrdersByRestaurant(restaurantId));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId,
                                                @RequestBody Map<String, String> body,
                                                HttpSession session) {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) return authCheck;

        Long ownerId = (Long) session.getAttribute("userId");
        try {
            String status = body.get("status"); // PREPARING, CANCELLED, PICKED_UP
            Order order = orderService.updateOrderStatus(orderId, status, ownerId, "OWNER");
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Reports ---
    @GetMapping("/restaurants/{restaurantId}/sales-report")
    public ResponseEntity<?> getSalesReport(@PathVariable Long restaurantId, HttpSession session) {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) return authCheck;

        Restaurant rest = restaurantService.getRestaurantById(restaurantId);
        Long ownerId = (Long) session.getAttribute("userId");
        if (!rest.getOwner().getId().equals(ownerId) && !"ADMIN".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Order> orders = orderService.getOrdersByRestaurant(restaurantId);
        double totalSales = 0.0;
        int completedCount = 0;
        Map<String, Integer> popularItems = new HashMap<>();

        for (Order o : orders) {
            if ("DELIVERED".equals(o.getStatus())) {
                totalSales += o.getTotalAmount();
                completedCount++;

                List<OrderItem> items = orderItemRepository.findByOrderId(o.getId());
                for (OrderItem oi : items) {
                    String name = oi.getMenuItem().getName();
                    popularItems.put(name, popularItems.getOrDefault(name, 0) + oi.getQuantity());
                }
            }
        }

        Map<String, Object> report = Map.of(
                "totalSales", Math.round(totalSales * 100.0) / 100.0,
                "totalOrders", orders.size(),
                "completedOrders", completedCount,
                "popularItems", popularItems
        );
        return ResponseEntity.ok(report);
    }

    // --- Reviews Sentiment Audit ---
    @GetMapping("/restaurants/{restaurantId}/reviews")
    public ResponseEntity<?> getRestaurantReviews(@PathVariable Long restaurantId, HttpSession session) {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) return authCheck;

        Restaurant rest = restaurantService.getRestaurantById(restaurantId);
        Long ownerId = (Long) session.getAttribute("userId");
        if (!rest.getOwner().getId().equals(ownerId) && !"ADMIN".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Review> reviews = restaurantService.getRestaurantReviews(restaurantId);
        long total = reviews.size();
        double avgRating = total > 0 ? reviews.stream().mapToInt(Review::getRating).average().orElse(0.0) : 0.0;
        avgRating = Math.round(avgRating * 10.0) / 10.0;

        Map<Integer, Long> starCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            final int star = i;
            starCounts.put(star, reviews.stream().filter(r -> r.getRating() == star).count());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("reviews", reviews);
        result.put("averageRating", avgRating);
        result.put("totalReviews", total);
        result.put("starCounts", starCounts);
        return ResponseEntity.ok(result);
    }

    // --- PDF Sales Statement Download ---
    @GetMapping("/restaurants/{restaurantId}/sales-report/pdf")
    public void downloadSalesPdf(@PathVariable Long restaurantId, HttpSession session, HttpServletResponse response) throws IOException {
        ResponseEntity<?> authCheck = checkOwnerRole(session);
        if (authCheck != null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Access restricted to restaurant owners.");
            return;
        }

        Restaurant rest = restaurantService.getRestaurantById(restaurantId);
        Long ownerId = (Long) session.getAttribute("userId");
        if (!rest.getOwner().getId().equals(ownerId) && !"ADMIN".equals(session.getAttribute("role"))) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        List<Order> orders = orderService.getOrdersByRestaurant(restaurantId);
        double totalSales = 0.0;
        int completedCount = 0;
        Map<String, Integer> popularItems = new HashMap<>();

        for (Order o : orders) {
            if ("DELIVERED".equals(o.getStatus())) {
                totalSales += o.getTotalAmount();
                completedCount++;
                List<OrderItem> items2 = orderItemRepository.findByOrderId(o.getId());
                for (OrderItem oi : items2) {
                    String name = oi.getMenuItem().getName();
                    popularItems.put(name, popularItems.getOrDefault(name, 0) + oi.getQuantity());
                }
            }
        }

        List<Map.Entry<String, Integer>> sortedItems = popularItems.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toList());

        try {
            com.lowagie.text.Document doc = new com.lowagie.text.Document();
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            com.lowagie.text.pdf.PdfWriter.getInstance(doc, baos);
            doc.open();

            com.lowagie.text.Font titleFont = com.lowagie.text.FontFactory.getFont(
                    com.lowagie.text.FontFactory.HELVETICA_BOLD, 18);
            com.lowagie.text.Font headFont = com.lowagie.text.FontFactory.getFont(
                    com.lowagie.text.FontFactory.HELVETICA_BOLD, 13);
            com.lowagie.text.Font bodyFont = com.lowagie.text.FontFactory.getFont(
                    com.lowagie.text.FontFactory.HELVETICA, 11);

            doc.add(new com.lowagie.text.Paragraph("FOOD FUSION  —  MONTHLY SALES REPORT", titleFont));
            doc.add(new com.lowagie.text.Paragraph(" "));
            doc.add(new com.lowagie.text.Paragraph("Restaurant: " + rest.getName(), headFont));
            doc.add(new com.lowagie.text.Paragraph("Cuisine: " + rest.getCuisineType(), bodyFont));
            doc.add(new com.lowagie.text.Paragraph("Generated: " + java.time.LocalDateTime.now().toString().substring(0, 16), bodyFont));
            doc.add(new com.lowagie.text.Paragraph(" "));
            doc.add(new com.lowagie.text.Paragraph("REVENUE SUMMARY", headFont));
            doc.add(new com.lowagie.text.Paragraph(String.format("Total Orders Logged: %d", orders.size()), bodyFont));
            doc.add(new com.lowagie.text.Paragraph(String.format("Completed Deliveries: %d", completedCount), bodyFont));
            doc.add(new com.lowagie.text.Paragraph(String.format("Total Revenue: Rs. %.2f", totalSales), bodyFont));
            doc.add(new com.lowagie.text.Paragraph(" "));
            doc.add(new com.lowagie.text.Paragraph("TOP 10 SELLING DISHES", headFont));
            int rank = 1;
            for (Map.Entry<String, Integer> entry : sortedItems) {
                doc.add(new com.lowagie.text.Paragraph(
                        String.format("%d. %s  —  %d units sold", rank++, entry.getKey(), entry.getValue()), bodyFont));
            }
            doc.add(new com.lowagie.text.Paragraph(" "));
            doc.add(new com.lowagie.text.Paragraph("ORDER HISTORY (last " + Math.min(orders.size(), 50) + " orders)", headFont));
            orders.stream().limit(50).forEach(o -> {
                try {
                    doc.add(new com.lowagie.text.Paragraph(String.format(
                            "  #%d  |  %-12s  |  %s  |  Rs. %.2f",
                            o.getId(), o.getStatus(),
                            o.getOrderTime() != null ? o.getOrderTime().toString().substring(0, 16) : "N/A",
                            o.getTotalAmount()), bodyFont));
                } catch (Exception ex) { /* skip */ }
            });
            doc.close();

            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition",
                    "attachment; filename=\"sales-report-" + rest.getName().replace(" ", "_") + ".pdf\"");
            response.getOutputStream().write(baos.toByteArray());
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "PDF generation failed: " + e.getMessage());
        }
    }
}
