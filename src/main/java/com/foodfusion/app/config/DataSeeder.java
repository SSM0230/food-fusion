package com.foodfusion.app.config;

import com.foodfusion.app.entity.*;
import com.foodfusion.app.repository.*;
import com.foodfusion.app.service.OrderService;
import com.foodfusion.app.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final OrderService orderService;

    private final Random random = new Random();

    public DataSeeder(UserRepository userRepository,
                      RestaurantRepository restaurantRepository,
                      MenuItemRepository menuItemRepository,
                      OrderRepository orderRepository,
                      ReviewRepository reviewRepository,
                      UserService userService,
                      OrderService orderService) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.userService = userService;
        this.orderService = orderService;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Already seeded
        }

        System.out.println(">>> Seeding 30 Premium Outlets & Custom Menus...");

        // 1. Seed Users
        User customer1 = userService.register("customer", "password", "customer@foodfusion.com", "CUSTOMER", LocalDate.of(1995, 8, 20));
        User customer2 = userService.register("alice", "password", "alice@foodfusion.com", "CUSTOMER", LocalDate.of(1998, 12, 5));
        User owner1 = userService.register("owner1", "password", "owner1@foodfusion.com", "OWNER", LocalDate.of(1985, 3, 10));
        User owner2 = userService.register("owner2", "password", "owner2@foodfusion.com", "OWNER", LocalDate.of(1990, 5, 14));
        User delivery1 = userService.register("delivery1", "password", "driver1@foodfusion.com", "DELIVERY", LocalDate.of(1996, 7, 22));
        User delivery2 = userService.register("delivery2", "password", "driver2@foodfusion.com", "DELIVERY", LocalDate.of(1999, 11, 30));
        User admin = userService.register("admin", "password", "admin@foodfusion.com", "ADMIN", LocalDate.of(1988, 1, 1));

        // 2. Seed User Addresses
        userService.addAddress(customer1.getId(), "Block 2A, Adyar Flats, L.B. Road", "Chennai", "600020");
        userService.addAddress(customer1.getId(), "15, Anna Nagar West, Near Arch", "Chennai", "600040");
        userService.addAddress(customer2.getId(), "104, Avinashi Road, Peelamedu", "Coimbatore", "641004");

        // 3. Define Cuisines & Restaurants (15 Cuisines, 5 Restaurants each = 75 restaurants)
        String[][] cuisineRests = {
            {"Biryani", "Behrouz Biryani", "Paradise Biryani"},
            {"Pizza", "Domino's Pizza", "Pizza Hut"},
            {"Burger", "McDonald's", "Burger King"},
            {"South Indian", "Saravana Bhavan", "Murugan Idli Shop"},
            {"North Indian", "Punjab Grill", "Barbeque Nation"},
            {"Chinese", "Chinese Wok", "Wow China"},
            {"Italian", "Toscano", "Little Italy"},
            {"Arabian", "Al Taza", "Mandi House"},
            {"BBQ & Grill", "Absolute BBQ", "Barbeque Nation India"},
            {"Street Food", "Chaat Corner", "Bombay Street"},
            {"Desserts", "Sweet Truth", "The Belgian Waffle"},
            {"Ice Cream", "Baskin Robbins", "Ibaco"},
            {"Beverages", "Starbucks", "Chaayos"},
            {"Bakery", "CakeZone Bakery", "OvenFresh"},
            {"Healthy Food", "FreshMenu", "Salad Days"}
        };

        List<Restaurant> restaurants = new ArrayList<>();
        for (String[] cr : cuisineRests) {
            String cuisine = cr[0];
            for (int i = 1; i < cr.length; i++) {
                String name = cr[i];
                User owner = (i % 2 == 0) ? owner1 : owner2;

                Restaurant restaurant = Restaurant.builder()
                    .name(name)
                    .description("Specialized cuisine from the experts at " + name + ".")
                    .cuisineType(cuisine)
                    .imageUrl(getRestaurantLogo(name))
                    .coverImageUrl(getRestaurantCover(name))
                    .rating(4.0 + (random.nextInt(10) / 10.0))
                    .deliveryTimeMin(15 + random.nextInt(25))
                    .distance(0.8 + (random.nextInt(45) / 10.0))
                    .minOrderAmount(99.0)
                    .deliveryFee(40.0)
                    .owner(owner)
                    .openTime("08:00")
                    .closeTime("23:00")
                    .open(true)
                    .build();

                restaurants.add(restaurantRepository.save(restaurant));
            }
        }

        // 4. Seed unique menu items (15-20 per restaurant)
        for (Restaurant rest : restaurants) {
            String[] dishes = getMenuForCuisine(rest.getCuisineType(), rest.getName());

            for (int i = 0; i < dishes.length; i++) {
                String name = dishes[i];
                double price = getRealisticPrice(name);
                double originalPrice = price + 30.0 + random.nextInt(50);
                int discount = (int) Math.round(((originalPrice - price) / originalPrice) * 100);

                boolean isVeg = !name.toLowerCase().contains("chicken") 
                    && !name.toLowerCase().contains("mutton") 
                    && !name.toLowerCase().contains("bacon") 
                    && !name.toLowerCase().contains("pepperoni") 
                    && !name.toLowerCase().contains("egg")
                    && !name.toLowerCase().contains("wings")
                    && !name.toLowerCase().contains("fish")
                    && !name.toLowerCase().contains("kebab");

                String img = getFoodImage(name, rest.getName());

                String category = "Mains";
                if (name.toLowerCase().contains("juice") || name.toLowerCase().contains("coke") || name.toLowerCase().contains("shake") || name.toLowerCase().contains("pepsi") || name.toLowerCase().contains("sprite") || name.toLowerCase().contains("fanta") || name.toLowerCase().contains("coffee") || name.toLowerCase().contains("water") || name.toLowerCase().contains("tea") || name.toLowerCase().contains("brew") || name.toLowerCase().contains("lassi")) {
                    category = "Beverages";
                } else if (name.toLowerCase().contains("fries") || name.toLowerCase().contains("roll") || name.toLowerCase().contains("spring") || name.toLowerCase().contains("nugget") || name.toLowerCase().contains("bread") || name.toLowerCase().contains("dip") || name.toLowerCase().contains("vada") || name.toLowerCase().contains("idli") || name.toLowerCase().contains("bruschetta") || name.toLowerCase().contains("salad") || name.toLowerCase().contains("kebab") || name.toLowerCase().contains("tikka") || name.toLowerCase().contains("wings")) {
                    category = "Starters";
                } else if (name.toLowerCase().contains("cake") || name.toLowerCase().contains("brownie") || name.toLowerCase().contains("waffle") || name.toLowerCase().contains("scoop") || name.toLowerCase().contains("sundae") || name.toLowerCase().contains("payasam") || name.toLowerCase().contains("pie") || name.toLowerCase().contains("frosty") || name.toLowerCase().contains("mousse") || name.toLowerCase().contains("tiramisu") || name.toLowerCase().contains("halwa") || name.toLowerCase().contains("jamun") || name.toLowerCase().contains("kheer") || name.toLowerCase().contains("rasmalai")) {
                    category = "Desserts";
                }

                MenuItem item = MenuItem.builder()
                    .restaurant(rest)
                    .name(name)
                    .description("Signature dish " + name + " prepared fresh with local herbs and spices.")
                    .price(price)
                    .originalPrice(originalPrice)
                    .discountPercent(discount)
                    .isVeg(isVeg)
                    .imageUrl(img)
                    .category(category)
                    .prepTimeMin(15 + random.nextInt(15))
                    .calories(180 + random.nextInt(450))
                    .protein((8 + random.nextInt(18)) + "g")
                    .spiceLevel(isVeg ? "Medium" : "Spicy")
                    .isBestSeller(i % 4 == 0)
                    .isChefSpecial(i % 6 == 0)
                    .customizableItems("Extra Cheese:25,Extra Sauce:15,Extra Toppings:35")
                    .isAvailable(true)
                    .build();

                menuItemRepository.save(item);
            }
        }

        // 5. Seed Coupons
        orderService.createCoupon("WELCOME50", "Flat ₹50.00 off on your first order!", 50.0, 0.0, 150.0, 30);
        orderService.createCoupon("FEAST20", "Save 20% on order values above ₹250!", 0.0, 20.0, 250.0, 14);
        orderService.createCoupon("CHENNAI100", "Flat ₹100.00 off on super feasts!", 100.0, 0.0, 450.0, 14);
        orderService.createCoupon("DIWALI200", "Festival Special: Flat ₹200.00 discount on family orders!", 200.0, 0.0, 500.0, 10);
        orderService.createCoupon("BIRTHDAY30", "Special Birthday Treat: Get 30% off your meal!", 0.0, 30.0, 199.0, 30);

        // 6. Seed Finished Orders
        Order o1 = Order.builder()
            .user(customer1)
            .restaurant(restaurants.get(0))
            .deliveryAddress("Block 2A, Adyar Flats, L.B. Road, Chennai")
            .status("DELIVERED")
            .orderTime(LocalDateTime.now().minusDays(5).withHour(13).withMinute(0))
            .totalAmount(380.0)
            .discountAmount(0.0)
            .deliveryFee(40.0)
            .platformFee(10.0)
            .tax(15.0)
            .packagingOption("STANDARD")
            .paymentMethod("CARD")
            .paid(true)
            .deliveryPartner(delivery1)
            .deliveryOtp(1234)
            .trackingTimeline("Placed (13:00) | Restaurant Accepted (13:05) | Preparing (13:10) | Packed (13:20) | Picked Up (13:25) | Delivered (13:40)")
            .build();
        o1 = orderRepository.save(o1);

        Order o2 = Order.builder()
            .user(customer2)
            .restaurant(restaurants.get(5))
            .deliveryAddress("104, Avinashi Road, Peelamedu, Coimbatore")
            .status("DELIVERED")
            .orderTime(LocalDateTime.now().minusDays(2).withHour(19).withMinute(30))
            .totalAmount(620.0)
            .discountAmount(50.0)
            .deliveryFee(40.0)
            .platformFee(10.0)
            .tax(25.0)
            .packagingOption("ECO")
            .paymentMethod("UPI")
            .paid(true)
            .deliveryPartner(delivery2)
            .deliveryOtp(5678)
            .trackingTimeline("Placed (19:30) | Restaurant Accepted (19:35) | Preparing (19:40) | Packed (19:52) | Picked Up (19:58) | Delivered (20:15)")
            .build();
        o2 = orderRepository.save(o2);

        // 7. Seed Reviews
        reviewRepository.save(Review.builder()
            .user(customer1)
            .restaurant(restaurants.get(0))
            .rating(5)
            .reviewText("Amazing flavor, highly authentic taste. Recommended!")
            .reviewDate(LocalDateTime.now().minusDays(4))
            .build());

        System.out.println(">>> Seeded 30 restaurants and " + (30 * 5) + " dishes!");
    }

    private String[] getMenuForCuisine(String cuisine, String restName) {
        String[] base;
        switch(cuisine) {
            case "Biryani":
                if (restName.contains("Behrouz")) {
                    base = new String[]{"Chicken Dum Biryani", "Mutton Dum Biryani", "Paneer Biryani", "Firni", "Coke"};
                } else {
                    base = new String[]{"Veg Biryani", "Egg Biryani", "Chicken 65", "Kebab", "Gulab Jamun"};
                }
                break;
            case "Pizza":
                if (restName.contains("Domino's")) {
                    base = new String[]{"Margherita Pizza", "Farmhouse Pizza", "Chicken Dominator", "Garlic Bread", "Choco Lava Cake"};
                } else {
                    base = new String[]{"Veggie Supreme", "Chicken Supreme", "Tandoori Paneer Pizza", "Garlic Bread", "Brownie"};
                }
                break;
            case "Burger":
                if (restName.contains("McDonald's")) {
                    base = new String[]{"McAloo Tikki", "McVeggie", "McSpicy Paneer", "McSpicy Chicken", "Chicken Maharaja"};
                } else {
                    base = new String[]{"Fries", "Nuggets", "Coke", "McFlurry", "French Fries Small"};
                }
                break;
            case "South Indian":
                if (restName.contains("Saravana")) {
                    base = new String[]{"Masala Dosa", "Plain Dosa", "Ghee Roast", "Idli", "Filter Coffee"};
                } else {
                    base = new String[]{"Mini Idli", "Pongal", "Vada", "Poori Masala", "Uttapam"};
                }
                break;
            case "North Indian":
                if (restName.contains("Punjab")) {
                    base = new String[]{"Butter Chicken", "Paneer Butter Masala", "Dal Makhani", "Butter Naan", "Lassi"};
                } else {
                    base = new String[]{"Garlic Naan", "Jeera Rice", "Chicken Tikka", "Tandoori Chicken", "Gulab Jamun"};
                }
                break;
            case "Chinese":
                if (restName.contains("Chinese Wok")) {
                    base = new String[]{"Veg Hakka Noodles", "Chicken Hakka Noodles", "Fried Rice", "Momos", "Brownie"};
                } else {
                    base = new String[]{"Schezwan Rice", "Manchurian", "Spring Rolls", "Chilli Chicken", "Dragon Chicken"};
                }
                break;
            case "Italian":
                if (restName.contains("Toscano")) {
                    base = new String[]{"Alfredo Pasta", "Arrabbiata Pasta", "Lasagna", "Bruschetta", "Lemon Tea"};
                } else {
                    base = new String[]{"Ravioli", "Garlic Bread", "Margherita Pizza", "Tiramisu", "Cheese Balls"};
                }
                break;
            case "Arabian":
                if (restName.contains("Al Taza")) {
                    base = new String[]{"Chicken Mandi", "Mutton Mandi", "Alfaham Chicken", "Shawarma", "Falooda"};
                } else {
                    base = new String[]{"Hummus", "Kuboos", "Garlic Sauce", "Kunafa", "Fresh Lime Soda"};
                }
                break;
            case "BBQ & Grill":
                if (restName.contains("Absolute")) {
                    base = new String[]{"Chicken Wings", "BBQ Chicken", "Grilled Fish", "Brownie", "Ice Cream"};
                } else {
                    base = new String[]{"Chicken Tikka", "Paneer Tikka", "Seekh Kebab", "Crispy Onion Rings", "Hot Chocolate Fudge"};
                }
                break;
            case "Street Food":
                if (restName.contains("Chaat")) {
                    base = new String[]{"Pani Puri", "Dahi Puri", "Pav Bhaji", "Vada Pav", "Sandwich"};
                } else {
                    base = new String[]{"Samosa", "Kachori", "Bhel Puri", "Sev Puri", "Masala Chai Hot"};
                }
                break;
            case "Desserts":
                if (restName.contains("Sweet")) {
                    base = new String[]{"Chocolate Cake", "Red Velvet Cake", "Brownie", "Tiramisu", "Donut"};
                } else {
                    base = new String[]{"Cheesecake", "Gulab Jamun", "Rasmalai", "Sizzling Brownie", "Sweet Gulab Jamun"};
                }
                break;
            case "Ice Cream":
                if (restName.contains("Baskin")) {
                    base = new String[]{"Chocolate Ice Cream", "Vanilla", "Butterscotch", "Black Forest", "Sundae"};
                } else {
                    base = new String[]{"Oreo Shake", "Falooda", "Vanilla Scoop Ice Cream", "Hot Chocolate Fudge", "Classic Soft Drink"};
                }
                break;
            case "Beverages":
                if (restName.contains("Starbucks")) {
                    base = new String[]{"Cappuccino", "Latte", "Espresso", "Cold Coffee", "Brownie"};
                } else {
                    base = new String[]{"Green Tea", "Lemon Tea", "Sandwich", "Masala Chai Hot", "Fresh Orange Juice"};
                }
                break;
            case "Bakery":
                if (restName.contains("CakeZone")) {
                    base = new String[]{"Garlic Bread", "Croissant", "Puff", "Donut", "Chocolate Cake"};
                } else {
                    base = new String[]{"Red Velvet Cake", "Cookies", "Muffins", "Garlic Breadsticks Slice", "Crispy Spring Roll"};
                }
                break;
            case "Healthy Food":
                if (restName.contains("FreshMenu")) {
                    base = new String[]{"Caesar Salad", "Greek Salad", "Grilled Chicken Bowl", "Veg Protein Bowl", "Sandwich"};
                } else {
                    base = new String[]{"Fruit Bowl", "Smoothie", "Oats Bowl", "Mineral Water Bottle", "Fresh Lime Soda"};
                }
                break;
            default:
                base = new String[]{"Signature Dish", "Chef Special Main", "Standard Starter", "Cold Beverage", "Sweet Dessert"};
        }

        String[] result = new String[base.length];
        for (int i = 0; i < base.length; i++) {
            result[i] = restName + " " + base[i];
        }
        return result;
    }

    private double getRealisticPrice(String dishName) {
        String n = dishName.toLowerCase();
        if (n.contains("pizza") || n.contains("margherita") || n.contains("supreme") || n.contains("dominator")) {
            return 199.0 + random.nextInt(400); // 199 - 599
        }
        if (n.contains("burger") || n.contains("mcaloo") || n.contains("mcveggie") || n.contains("mcspicy") || n.contains("maharaja")) {
            return 129.0 + random.nextInt(220); // 129 - 349
        }
        if (n.contains("biryani") || n.contains("biriyani")) {
            return 249.0 + random.nextInt(250); // 249 - 499
        }
        if (n.contains("dosa") || n.contains("roast") || n.contains("idli") || n.contains("pongal") || n.contains("vada") || n.contains("poori") || n.contains("uttapam")) {
            return 89.0 + random.nextInt(100); // 89 - 189
        }
        if (n.contains("pasta") || n.contains("lasagna") || n.contains("ravioli") || n.contains("noodle") || n.contains("noodles") || n.contains("manchurian")) {
            return 199.0 + random.nextInt(200); // 199 - 399
        }
        if (n.contains("shawarma") || n.contains("mandi") || n.contains("alfaham")) {
            return 149.0 + random.nextInt(100); // 149 - 249
        }
        if (n.contains("cake") || n.contains("brownie") || n.contains("mousse") || n.contains("tiramisu") || n.contains("cheesecake") || n.contains("donut") || n.contains("muffin") || n.contains("halwa") || n.contains("jamun") || n.contains("kheer") || n.contains("rasmalai")) {
            return 99.0 + random.nextInt(200); // 99 - 299
        }
        if (n.contains("coffee") || n.contains("latte") || n.contains("espresso") || n.contains("cappuccino") || n.contains("tea") || n.contains("smoothie") || n.contains("shake")) {
            return 99.0 + random.nextInt(150); // 99 - 249
        }
        if (n.contains("ice cream") || n.contains("sundae") || n.contains("scoop")) {
            return 89.0 + random.nextInt(160); // 89 - 249
        }
        return 99.0 + random.nextInt(150);
    }

    private String getRestaurantLogo(String restName) {
        String formatted = restName.toLowerCase().replace("'", "").replaceAll("[^a-z0-9]", "_").replaceAll("_+", "_").replaceAll("^_|_$", "");
        return "/images/restaurants/" + formatted + ".jpg";
    }
    private String getRestaurantCover(String restName) {
        String formatted = restName.toLowerCase().replace("'", "").replaceAll("[^a-z0-9]", "_").replaceAll("_+", "_").replaceAll("^_|_$", "");
        return "/images/restaurants/" + formatted + "_cover.jpg";
    }
    private String getFoodImage(String name, String restName) {
        String dishName = name;
        if (name.startsWith(restName + " ")) {
            dishName = name.substring(restName.length() + 1);
        }
        String formatted = dishName.toLowerCase().replace("'", "").replaceAll("[^a-z0-9]", "_").replaceAll("_+", "_").replaceAll("^_|_$", "");
        return "/images/menu/" + formatted + ".jpg";
    }
}
