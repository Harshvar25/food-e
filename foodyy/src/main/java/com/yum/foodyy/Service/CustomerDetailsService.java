package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Entity.CustomerPrincipal;
import com.yum.foodyy.Repo.CustomerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomerDetailsService implements UserDetailsService {

    @Autowired
    private CustomerRepo customerRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        CustomerInfo customerInfo = customerRepo.findByEmail(email);

        if(customerInfo == null){
            throw new UsernameNotFoundException("Customer not found with email: " + email);
        }

        return new CustomerPrincipal(customerInfo);

    }
}
