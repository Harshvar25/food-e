package com.yum.foodyy.Entity.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        String orderId,
        String customerName,
        String email,
        String address,
        String status,
        LocalDateTime orderDateTime,
        BigDecimal totalAmount,
        List<OrderItemResponse> items
) {
}
