package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Repo.CustomerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepo customerRepo;

    public long count() {
        return customerRepo.count();
    }

    public List<CustomerInfo> getAllCustomers() {
        return customerRepo.findAll();
    }

    public CustomerInfo addOrUpdateCustomer(CustomerInfo customer) {
        return customerRepo.save(customer);
    }

    public Optional<CustomerInfo> getCustById(int id) {
        return customerRepo.findById(id);
    }

    public void deleteCustomer(int id) {
        customerRepo.deleteById(id);
        return;
    }

    public List<CustomerInfo> searchCustomer(String keyword) {
        System.out.println("Searching for keyword: " + keyword);
        return customerRepo.searchCustomer(keyword);
    }

    public Optional<CustomerInfo> getCustByEmail(String email) {
        return customerRepo.findByEmail(email);
    }

    public Optional<CustomerInfo> getCustByPhone(String phone) {
        return customerRepo.findByPhone(phone);
    }
}
