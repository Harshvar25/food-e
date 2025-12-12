package com.yum.foodyy.Repo;

import com.yum.foodyy.Entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepo extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByCustomerInfo_CustomerIdOrderByOrderDateDesc(int custId);

    CustomerOrder findByOrderId(String orderId);
}
