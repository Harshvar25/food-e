package com.yum.foodyy.Entity.DTO;

import com.yum.foodyy.Entity.CustomerInfo;

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
