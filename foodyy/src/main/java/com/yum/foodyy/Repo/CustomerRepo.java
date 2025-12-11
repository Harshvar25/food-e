package com.yum.foodyy.Repo;

import com.yum.foodyy.Entity.CustomerInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepo extends JpaRepository<CustomerInfo,Integer> {

    @Query("SELECT c FROM CustomerInfo c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<CustomerInfo> searchCustomer(@Param("keyword") String keyword);

    CustomerInfo findByEmail(String email);

    Optional<CustomerInfo> findByPhone(String phone);
}
