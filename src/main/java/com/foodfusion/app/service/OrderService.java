package com.foodfusion.app.service;

import com.foodfusion.app.entity.*;
import com.foodfusion.app.repository.*;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupOrderRepository groupOrderRepository;

    // --- Cart Management ---
    public List<CartItem> getCart(Long userId) {
        return cartItemRepository.findByUserIdAndGroupCodeIsNull(userId);
    }

    @Transactional
    public CartItem addToCart(Long userId, Long menuItemId, int quantity, String customizations) {
        User user = userService.getUserById(userId);
        MenuItem item = restaurantService.getMenuItemById(menuItemId);

        Optional<CartItem> existing = cartItemRepository.findByUserIdAndMenuItemIdAndGroupCodeIsNull(userId, menuItemId);
        if (existing.isPresent()) {
            CartItem cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItem.setCustomizations(customizations);
            return cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .user(user)
                    .menuItem(item)
                    .quantity(quantity)
                    .customizations(customizations)
                    .build();
            return cartItemRepository.save(cartItem);
        }
    }

    @Transactional
    public void updateCartQuantity(Long cartItemId, int quantity, Long userId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
    }

    @Transactional
    public void removeFromCart(Long cartItemId, Long userId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserIdAndGroupCodeIsNull(userId);
    }

    // --- Coupon Management ---
    public Coupon validateCoupon(String code, Double orderAmount) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Invalid coupon code"));
        if (!coupon.isActive()) {
            throw new RuntimeException("Coupon is expired or inactive");
        }
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now().toLocalDate())) {
            throw new RuntimeException("Coupon has expired");
        }
        if (orderAmount < coupon.getMinOrderValue()) {
            throw new RuntimeException("Order amount must be at least $" + coupon.getMinOrderValue() + " to use this coupon");
        }
        return coupon;
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon createCoupon(String code, String description, Double discountAmount, Double discountPercent, Double minOrderValue, int durationDays) {
        Coupon coupon = Coupon.builder()
                .code(code.toUpperCase())
                .description(description)
                .discountAmount(discountAmount != null ? discountAmount : 0.0)
                .discountPercent(discountPercent != null ? discountPercent : 0.0)
                .minOrderValue(minOrderValue != null ? minOrderValue : 0.0)
                .expiryDate(LocalDateTime.now().toLocalDate().plusDays(durationDays))
                .active(true)
                .build();
        return couponRepository.save(coupon);
    }

    // --- Checkout & Orders ---
    @Transactional
    public Order placeOrder(Long userId, String addressLine, String paymentMethod, String couponCode,
                            String packagingOption, boolean isGift, String giftMessage, LocalDateTime scheduledTime,
                            String groupCode, Double deliveryTip) {
        User user = userService.getUserById(userId);

        // Fetch Cart Items
        List<CartItem> cartItems;
        Restaurant restaurant;
        if (groupCode != null && !groupCode.isEmpty()) {
            cartItems = cartItemRepository.findByGroupCode(groupCode);
            if (cartItems.isEmpty()) {
                throw new RuntimeException("Group cart is empty");
            }
            restaurant = cartItems.get(0).getMenuItem().getRestaurant();
        } else {
            cartItems = getCart(userId);
            if (cartItems.isEmpty()) {
                throw new RuntimeException("Cart is empty");
            }
            restaurant = cartItems.get(0).getMenuItem().getRestaurant();
        }

        // Calculate Totals
        double subtotal = 0.0;
        for (CartItem item : cartItems) {
            subtotal += item.getMenuItem().getPrice() * item.getQuantity();
        }

        double discount = 0.0;
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            try {
                Coupon c = validateCoupon(couponCode, subtotal);
                if (c.getDiscountAmount() > 0) {
                    discount = c.getDiscountAmount();
                } else if (c.getDiscountPercent() > 0) {
                    discount = (subtotal * c.getDiscountPercent()) / 100.0;
                }
            } catch (Exception e) {
                // Ignore invalid coupon during checkout, just don't apply discount
            }
        }

        double deliveryFee = 40.0;
        double platformFee = 10.0;
        double tax = 0.05 * (subtotal - discount);
        if (tax < 0) tax = 0;

        double packagingFee = "ECO".equalsIgnoreCase(packagingOption) ? 15.0 : 0.0;

        double tipVal = deliveryTip != null ? deliveryTip : 0.0;
        double totalAmount = subtotal - discount + deliveryFee + platformFee + tax + packagingFee + tipVal;
        totalAmount = Math.max(0, Math.round(totalAmount * 100.0) / 100.0);

        // Timeline String
        String nowStr = LocalDateTime.now().toString().substring(11, 16);
        String timeline = "Placed (" + nowStr + ")";

        // Generate 4-digit dynamic OTP
        int otp = 1000 + (int)(Math.random() * 9000);

        // Place Order
        Order order = Order.builder()
                .user(user)
                .restaurant(restaurant)
                .deliveryAddress(addressLine)
                .status("PLACED")
                .orderTime(LocalDateTime.now())
                .scheduledTime(scheduledTime)
                .totalAmount(totalAmount)
                .discountAmount(discount)
                .deliveryFee(deliveryFee)
                .platformFee(platformFee)
                .tax(tax)
                .packagingOption(packagingOption)
                .isGift(isGift)
                .giftMessage(giftMessage)
                .trackingTimeline(timeline)
                .paymentMethod(paymentMethod)
                .paid(!"COD".equalsIgnoreCase(paymentMethod)) // COD is unpaid, others are card/upi mock paid
                .deliveryOtp(otp)
                .deliveryTip(tipVal)
                .build();

        order = orderRepository.save(order);

        // Copy Cart Items to Order Items
        for (CartItem item : cartItems) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(item.getMenuItem())
                    .quantity(item.getQuantity())
                    .customizations(item.getCustomizations() + (item.getMemberName() != null ? " [Added by " + item.getMemberName() + "]" : ""))
                    .price(item.getMenuItem().getPrice())
                    .build();
            orderItemRepository.save(orderItem);
        }

        // Add Loyalty Points (1 point for every $10 spent)
        int pointsEarned = (int) (totalAmount / 10);
        if (pointsEarned > 0) {
            userService.addLoyaltyPoints(userId, pointsEarned);
        }

        // Clear Carts
        if (groupCode != null && !groupCode.isEmpty()) {
            cartItemRepository.deleteByGroupCode(groupCode);
            groupOrderRepository.findByGroupCode(groupCode).ifPresent(go -> {
                go.setActive(false);
                groupOrderRepository.save(go);
            });
        } else {
            clearCart(userId);
        }

        return order;
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getOrdersByRestaurant(Long restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId);
    }

    public List<Order> getOrdersByPartner(Long partnerId) {
        return orderRepository.findByDeliveryPartnerId(partnerId);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status, Long actorId, String actorRole) {
        Order order = getOrderById(orderId);

        // Authorization checks
        if ("OWNER".equalsIgnoreCase(actorRole)) {
            if (!order.getRestaurant().getOwner().getId().equals(actorId)) {
                throw new RuntimeException("Unauthorized");
            }
        } else if ("DELIVERY".equalsIgnoreCase(actorRole)) {
            if (order.getDeliveryPartner() != null && !order.getDeliveryPartner().getId().equals(actorId)) {
                throw new RuntimeException("Unauthorized");
            }
        }

        order.setStatus(status.toUpperCase());
        String nowStr = LocalDateTime.now().toString().substring(11, 16);
        order.setTrackingTimeline(order.getTrackingTimeline() + " | " + status + " (" + nowStr + ")");

        if ("DELIVERED".equalsIgnoreCase(status)) {
            order.setPaid(true); // Delivered orders are paid (e.g. COD collections)
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order assignDeliveryPartner(Long orderId, Long partnerId) {
        Order order = getOrderById(orderId);
        User partner = userService.getUserById(partnerId);
        if (!"DELIVERY".equalsIgnoreCase(partner.getRole())) {
            throw new RuntimeException("User is not a delivery partner");
        }
        order.setDeliveryPartner(partner);
        return orderRepository.save(order);
    }

    @Transactional
    public Order reorder(Long orderId, Long userId) {
        Order oldOrder = getOrderById(orderId);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        clearCart(userId);
        for (OrderItem item : items) {
            addToCart(userId, item.getMenuItem().getId(), item.getQuantity(), item.getCustomizations());
        }
        return oldOrder;
    }

    // --- Invoice Generation ---
    public byte[] generateInvoicePdf(Long orderId) {
        Order order = getOrderById(orderId);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            document.add(new Paragraph("=================================================="));
            document.add(new Paragraph("             FOOD FUSION INVOICE                  "));
            document.add(new Paragraph("=================================================="));
            document.add(new Paragraph("Order ID: " + order.getId()));
            document.add(new Paragraph("Date: " + order.getOrderTime()));
            document.add(new Paragraph("Customer: " + order.getUser().getUsername()));
            document.add(new Paragraph("Restaurant: " + order.getRestaurant().getName()));
            document.add(new Paragraph("Delivery Address: " + order.getDeliveryAddress()));
            document.add(new Paragraph("Status: " + order.getStatus()));
            document.add(new Paragraph("Payment Method: " + order.getPaymentMethod()));
            document.add(new Paragraph("--------------------------------------------------"));
            document.add(new Paragraph("Items Ordered:"));

            double subtotal = 0;
            for (OrderItem item : items) {
                double itemTotal = item.getPrice() * item.getQuantity();
                subtotal += itemTotal;
                document.add(new Paragraph(String.format(" - %s x%d : Rs. %.2f (%s)",
                        item.getMenuItem().getName(),
                        item.getQuantity(),
                        itemTotal,
                        item.getCustomizations() != null && !item.getCustomizations().isEmpty() ? item.getCustomizations() : "Standard")));
            }

            document.add(new Paragraph("--------------------------------------------------"));
            document.add(new Paragraph(String.format("Subtotal: Rs. %.2f", subtotal)));
            document.add(new Paragraph(String.format("Discount: -Rs. %.2f", order.getDiscountAmount())));
            document.add(new Paragraph(String.format("Delivery Fee: Rs. %.2f", order.getDeliveryFee())));
            document.add(new Paragraph(String.format("Platform Fee: Rs. %.2f", order.getPlatformFee())));
            document.add(new Paragraph(String.format("Tax (5%%): Rs. %.2f", order.getTax())));
            if ("ECO".equalsIgnoreCase(order.getPackagingOption())) {
                document.add(new Paragraph("Eco-Packaging Option: Rs. 15.00"));
            }
            document.add(new Paragraph(String.format("Total Charged: Rs. %.2f", order.getTotalAmount())));
            document.add(new Paragraph("=================================================="));
            if (order.isGift()) {
                document.add(new Paragraph("Gift Message: " + order.getGiftMessage()));
                document.add(new Paragraph("=================================================="));
            }
            document.add(new Paragraph("Thank you for ordering with Food Fusion!"));
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF invoice", e);
        }

        return baos.toByteArray();
    }
}
