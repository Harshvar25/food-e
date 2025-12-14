package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.Address;
import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Repo.CustomerAddressRepo;
import com.yum.foodyy.Repo.CustomerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerAddressService {

    @Autowired private CustomerRepo customerRepo;
    @Autowired private CustomerAddressRepo customerAddressRepo;

    public List<Address> findByCustomerId(int custId) {
        return customerAddressRepo.findByCustomerInfo_CustomerId(custId);
    }

    public Address saveAddressOrUpdate(int custId, Address address) {
        CustomerInfo customerInfo = customerRepo.findById(custId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        address.setCustomerInfo(customerInfo);
        return customerAddressRepo.save(address);
    }

    public Optional<Address> getAddress(Integer id) {
        return customerAddressRepo.findById(id);
    }

    public boolean deleteAddress(int addressId) {
        if(customerAddressRepo.existsById(addressId)) {
            customerAddressRepo.deleteById(addressId);
            return true;
        }
        return false;
    }
}