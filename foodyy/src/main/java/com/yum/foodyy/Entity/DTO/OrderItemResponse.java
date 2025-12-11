package com.yum.foodyy.Entity.DTO;

import java.math.BigDecimal;

public record OrderItemResponse(
    String foodName,
    int quantity,
    BigDecimal totalPrice
) {
}
