package com.foodfusion.app.controller;

import com.foodfusion.app.entity.CartItem;
import com.foodfusion.app.entity.ChatMessage;
import com.foodfusion.app.entity.GroupOrder;
import com.foodfusion.app.entity.WishlistItem;
import com.foodfusion.app.repository.CartItemRepository;
import com.foodfusion.app.repository.ChatMessageRepository;
import com.foodfusion.app.repository.WishlistItemRepository;
import com.foodfusion.app.service.FeatureService;
import com.foodfusion.app.service.RestaurantService;
import com.foodfusion.app.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/features")
public class FeatureController {

    @Autowired
    private FeatureService featureService;

    @Autowired
    private WishlistItemRepository wishlistRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RestaurantService restaurantService;

    // --- Spin & Win ---
    @PostMapping("/spin-and-win")
    public ResponseEntity<?> spinAndWin(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login first"));
        }
        try {
            Map<String, Object> spinResult = featureService.spinAndWin(userId);
            return ResponseEntity.ok(spinResult);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Budget Meal Finder ---
    @GetMapping("/budget-meals")
    public ResponseEntity<?> findBudgetMeals(@RequestParam Double maxBudget) {
        if (maxBudget == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "maxBudget is required"));
        }
        return ResponseEntity.ok(featureService.findMealsWithinBudget(maxBudget));
    }

    // --- Surprise Me ---
    @GetMapping("/surprise-me")
    public ResponseEntity<?> surpriseMe(@RequestParam(required = false) String category,
                                        @RequestParam(required = false) Boolean isVeg,
                                        @RequestParam(required = false) Double maxPrice) {
        try {
            return ResponseEntity.ok(featureService.getRandomMeal(category, isVeg, maxPrice));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Food Challenges ---
    @GetMapping("/challenges")
    public ResponseEntity<?> getChallenges(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please login first"));
        }
        return ResponseEntity.ok(featureService.getChallengesProgress(userId));
    }

    // --- Group Ordering Lobby ---
    @PostMapping("/group-ordering/create")
    public ResponseEntity<?> createGroupOrder(@RequestBody Map<String, Long> body, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            Long restaurantId = body.get("restaurantId");
            GroupOrder go = featureService.createGroupOrder(userId, restaurantId);
            return ResponseEntity.ok(go);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/group-ordering/join")
    public ResponseEntity<?> joinGroupOrder(@RequestParam String code) {
        try {
            GroupOrder go = featureService.joinGroupOrder(code);
            return ResponseEntity.ok(go);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/group-ordering/add-item")
    public ResponseEntity<?> addToGroupCart(@RequestBody Map<String, Object> body) {
        try {
            String code = (String) body.get("code");
            String memberName = (String) body.get("memberName");
            Number itemIdVal = (Number) body.get("menuItemId");
            Long menuItemId = itemIdVal.longValue();
            Integer quantity = (Integer) body.get("quantity");
            if (quantity == null) quantity = 1;

            CartItem ci = featureService.addToGroupCart(code, memberName, menuItemId, quantity);
            return ResponseEntity.ok(ci);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/group-ordering/items")
    public ResponseEntity<?> getGroupItems(@RequestParam String code) {
        try {
            List<CartItem> items = cartItemRepository.findByGroupCode(code.toUpperCase());
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Order Chat ---
    @GetMapping("/chat")
    public ResponseEntity<?> getChatMessages(@RequestParam Long orderId, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<ChatMessage> logs = chatMessageRepository.findByOrderIdOrderByTimestampAsc(orderId);
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/chat")
    public ResponseEntity<?> postChatMessage(@RequestBody Map<String, Object> body, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        String username = (String) session.getAttribute("username");
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            Number orderIdVal = (Number) body.get("orderId");
            Long orderId = orderIdVal.longValue();
            String message = (String) body.get("message");

            ChatMessage msg = ChatMessage.builder()
                    .orderId(orderId)
                    .sender(username)
                    .message(message)
                    .timestamp(LocalDateTime.now())
                    .build();

            return ResponseEntity.ok(chatMessageRepository.save(msg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Wishlist ---
    @GetMapping("/wishlist")
    public ResponseEntity<?> getWishlist(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(wishlistRepository.findByUserId(userId));
    }

    @PostMapping("/wishlist/toggle")
    public ResponseEntity<?> toggleWishlist(@RequestBody Map<String, Long> body, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Long restaurantId = body.get("restaurantId");
        Long menuItemId = body.get("menuItemId");

        if (restaurantId != null) {
            Optional<WishlistItem> exist = wishlistRepository.findByUserIdAndRestaurantId(userId, restaurantId);
            if (exist.isPresent()) {
                wishlistRepository.delete(exist.get());
                return ResponseEntity.ok(Map.of("action", "removed", "type", "restaurant"));
            } else {
                WishlistItem item = WishlistItem.builder()
                        .user(userService.getUserById(userId))
                        .restaurant(restaurantService.getRestaurantById(restaurantId))
                        .build();
                wishlistRepository.save(item);
                return ResponseEntity.ok(Map.of("action", "added", "type", "restaurant"));
            }
        } else if (menuItemId != null) {
            Optional<WishlistItem> exist = wishlistRepository.findByUserIdAndMenuItemId(userId, menuItemId);
            if (exist.isPresent()) {
                wishlistRepository.delete(exist.get());
                return ResponseEntity.ok(Map.of("action", "removed", "type", "food"));
            } else {
                WishlistItem item = WishlistItem.builder()
                        .user(userService.getUserById(userId))
                        .menuItem(restaurantService.getMenuItemById(menuItemId))
                        .build();
                wishlistRepository.save(item);
                return ResponseEntity.ok(Map.of("action", "added", "type", "food"));
            }
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Invalid arguments"));
    }
}
