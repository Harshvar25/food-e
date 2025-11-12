package com.yum.foodyy.Repo;

import com.yum.foodyy.Entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepo extends JpaRepository<Admin,Integer> {
    Admin findByUsername(String username);
}
