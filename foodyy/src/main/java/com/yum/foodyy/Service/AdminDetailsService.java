package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.Admin;
import com.yum.foodyy.Entity.AdminPrincipal;
import com.yum.foodyy.Repo.AdminRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AdminDetailsService implements UserDetailsService {

    @Autowired
    private AdminRepo adminRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Attempting login for: " + username);
        Admin admin = adminRepo.findByUsername(username);
        if (admin == null) {
            System.out.println("No user found for username: " + username);
            throw new UsernameNotFoundException("User not found");
        }
        System.out.println("Found user: " + admin.getUsername());
        return new AdminPrincipal(admin);
    }

}
