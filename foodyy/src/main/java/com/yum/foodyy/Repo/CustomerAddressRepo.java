package com.yum.foodyy.Repo;

import com.yum.foodyy.Entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerAddressRepo extends JpaRepository<Address, Integer> {

    List<Address> findByCustomerInfo_CustomerId(int custId);
}
