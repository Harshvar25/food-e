package com.yum.foodyy.Entity.DTO;

public record OrderItemRequest(
        int foodId,
        int quantity
) {
}
