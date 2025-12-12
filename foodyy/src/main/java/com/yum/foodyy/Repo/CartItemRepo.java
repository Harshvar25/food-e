package com.yum.foodyy.Repo;

import com.yum.foodyy.Entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem,Integer> {
    void deleteByFoodId(int foodId);

    List<CartItem> findByCart_CustomerInfo_CustomerId(int customerId);
}
