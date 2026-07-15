package com.foodfusion.app.repository;

import com.foodfusion.app.entity.GroupOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GroupOrderRepository extends JpaRepository<GroupOrder, Long> {
    Optional<GroupOrder> findByGroupCode(String groupCode);
}
