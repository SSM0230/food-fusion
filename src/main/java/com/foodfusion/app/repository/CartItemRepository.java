package com.foodfusion.app.repository;

import com.foodfusion.app.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserIdAndGroupCodeIsNull(Long userId);
    List<CartItem> findByGroupCode(String groupCode);
    Optional<CartItem> findByUserIdAndMenuItemIdAndGroupCodeIsNull(Long userId, Long menuItemId);
    Optional<CartItem> findByGroupCodeAndMenuItemIdAndMemberName(String groupCode, Long menuItemId, String memberName);
    void deleteByUserIdAndGroupCodeIsNull(Long userId);
    void deleteByGroupCode(String groupCode);
}
