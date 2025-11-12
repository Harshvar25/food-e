package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.Admin;
import com.yum.foodyy.Repo.AdminRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepo adminRepo;

    public Optional<Admin> getAdminByUsername(String username) {
        return Optional.ofNullable(adminRepo.findByUsername(username));
    }
}
