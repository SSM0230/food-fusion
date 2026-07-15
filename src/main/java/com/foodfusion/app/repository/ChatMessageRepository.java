package com.foodfusion.app.repository;

import com.foodfusion.app.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByOrderIdOrderByTimestampAsc(Long orderId);
}
