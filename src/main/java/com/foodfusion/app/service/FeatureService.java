package com.foodfusion.app.service;

import com.foodfusion.app.entity.*;
import com.foodfusion.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeatureService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupOrderRepository groupOrderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderService orderService;

    // --- Spin & Win ---
    @Transactional
    public Map<String, Object> spinAndWin(Long userId) {
        // Simple random rewards
        String[] prizes = {
                "10 POINTS", "20 POINTS", "50 POINTS",
                "COUPON:SPIN10", "COUPON:SPIN20", "TRY AGAIN"
        };
        int index = new Random().nextInt(prizes.length);
        String prize = prizes[index];

        Map<String, Object> result = new HashMap<>();
        result.put("prize", prize);

        if (prize.contains("POINTS")) {
            int pts = Integer.parseInt(prize.split(" ")[0]);
            userService.addLoyaltyPoints(userId, pts);
            result.put("message", "Congratulations! You won " + pts + " Loyalty Points!");
        } else if (prize.contains("COUPON")) {
            String code = prize.split(":")[1];
            // Ensure coupon exists or create it
            try {
                orderService.createCoupon(code, "Spin & Win Coupon", 0.0,
                        "SPIN10".equals(code) ? 10.0 : 20.0, 5.0, 1);
            } catch (Exception e) {
                // coupon might already exist
            }
            result.put("message", "Congratulations! You won a coupon: " + code + " (Use within 24 hours)");
        } else {
            result.put("message", "Better luck next time!");
        }

        return result;
    }

    // --- Budget Meal Finder ---
    public List<MenuItem> findMealsWithinBudget(Double maxBudget) {
        List<MenuItem> all = menuItemRepository.findAll();
        return all.stream()
                .filter(MenuItem::isAvailable)
                .filter(item -> item.getPrice() <= maxBudget)
                .sorted(Comparator.comparingDouble(MenuItem::getPrice))
                .collect(Collectors.toList());
    }

    // --- Surprise Me ---
    public MenuItem getRandomMeal(String category, Boolean isVeg, Double maxPrice) {
        List<MenuItem> items = menuItemRepository.findAll().stream()
                .filter(MenuItem::isAvailable)
                .filter(item -> category == null || category.equalsIgnoreCase("ALL") || item.getCategory().equalsIgnoreCase(category))
                .filter(item -> isVeg == null || item.isVeg() == isVeg)
                .filter(item -> maxPrice == null || item.getPrice() <= maxPrice)
                .collect(Collectors.toList());

        if (items.isEmpty()) {
            throw new RuntimeException("No meals found matching your preferences.");
        }

        return items.get(new Random().nextInt(items.size()));
    }

    // --- Group Ordering ---
    @Transactional
    public GroupOrder createGroupOrder(Long hostId, Long restaurantId) {
        User host = userService.getUserById(hostId);
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        GroupOrder groupOrder = GroupOrder.builder()
                .groupCode(code)
                .host(host)
                .restaurant(restaurant)
                .active(true)
                .build();

        return groupOrderRepository.save(groupOrder);
    }

    public GroupOrder joinGroupOrder(String groupCode) {
        return groupOrderRepository.findByGroupCode(groupCode.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Group order session not found or inactive"));
    }

    @Transactional
    public CartItem addToGroupCart(String groupCode, String memberName, Long menuItemId, int quantity) {
        GroupOrder go = joinGroupOrder(groupCode);
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        if (!item.getRestaurant().getId().equals(go.getRestaurant().getId())) {
            throw new RuntimeException("Item must belong to the group session restaurant: " + go.getRestaurant().getName());
        }

        Optional<CartItem> existing = cartItemRepository.findByGroupCodeAndMenuItemIdAndMemberName(go.getGroupCode(), menuItemId, memberName);
        if (existing.isPresent()) {
            CartItem cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            return cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .user(go.getHost()) // items belong to the host's cart eventually
                    .menuItem(item)
                    .quantity(quantity)
                    .groupCode(go.getGroupCode())
                    .memberName(memberName)
                    .build();
            return cartItemRepository.save(cartItem);
        }
    }

    // --- Food Challenges & Achievements ---
    public List<Map<String, Object>> getChallengesProgress(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);

        // Challenge 1: Eco-Warrior (Order with Eco-Packaging 2 times)
        long ecoOrdersCount = orders.stream()
                .filter(o -> "ECO".equalsIgnoreCase(o.getPackagingOption()))
                .count();

        // Challenge 2: Cuisine Explorer (Order from 3 different restaurants)
        long uniqueRestaurantsCount = orders.stream()
                .map(o -> o.getRestaurant().getId())
                .distinct()
                .count();

        // Challenge 3: Sweet Tooth (Order at least one item of category "Desserts")
        boolean orderedDessert = false;
        for (Order o : orders) {
            List<OrderItem> items = orderItemRepository.findByOrderId(o.getId());
            for (OrderItem oi : items) {
                if ("Desserts".equalsIgnoreCase(oi.getMenuItem().getCategory())) {
                    orderedDessert = true;
                    break;
                }
            }
        }

        List<Map<String, Object>> list = new ArrayList<>();

        Map<String, Object> c1 = new HashMap<>();
        c1.put("id", 1);
        c1.put("name", "Eco Warrior");
        c1.put("description", "Choose sustainable Eco-Packaging on 2 orders.");
        c1.put("target", 2);
        c1.put("current", ecoOrdersCount);
        c1.put("completed", ecoOrdersCount >= 2);
        c1.put("reward", "50 Points");
        list.add(c1);

        Map<String, Object> c2 = new HashMap<>();
        c2.put("id", 2);
        c2.put("name", "Cuisine Explorer");
        c2.put("description", "Order from 3 different restaurants.");
        c2.put("target", 3);
        c2.put("current", uniqueRestaurantsCount);
        c2.put("completed", uniqueRestaurantsCount >= 3);
        c2.put("reward", "100 Points");
        list.add(c2);

        Map<String, Object> c3 = new HashMap<>();
        c3.put("id", 3);
        c3.put("name", "Sweet Tooth");
        c3.put("description", "Treat yourself by ordering any item from the 'Desserts' category.");
        c3.put("target", 1);
        c3.put("current", orderedDessert ? 1 : 0);
        c3.put("completed", orderedDessert);
        c3.put("reward", "20 Points");
        list.add(c3);

        return list;
    }
}
