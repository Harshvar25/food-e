package com.yum.foodyy.Repo;

import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Entity.Food;
import com.yum.foodyy.Entity.Wishlist;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepo extends JpaRepository<Wishlist , Integer> {

    boolean existsByCustomerInfoAndFood(CustomerInfo customerInfo, Food food);

    Optional<Object> findByCustomerInfoAndFood(CustomerInfo customerInfo, Food food);

    List<Wishlist> findByCustomerInfo_CustomerId(Integer customerId);

    @Transactional
    void deleteByFood_Id(int foodId);
}
