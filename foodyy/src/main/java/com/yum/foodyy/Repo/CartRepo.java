package com.yum.foodyy.Repo;

import com.yum.foodyy.Entity.Cart;
import com.yum.foodyy.Entity.CartItem;
import com.yum.foodyy.Entity.CustomerInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepo extends JpaRepository<Cart,Integer> {

    Optional<Cart> findByCustomer(CustomerInfo customer);

    List<CartItem> findByCustomer_CustomerId(int customerId);

}
