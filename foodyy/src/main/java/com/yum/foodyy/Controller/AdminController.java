package com.yum.foodyy.Controller;

import com.yum.foodyy.Entity.DTO.AdminLoginReq;
import com.yum.foodyy.Service.AdminService;
import com.yum.foodyy.Service.CustomerService;
import com.yum.foodyy.Service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/signin")
    public ResponseEntity<?> adminSignIn(@RequestBody AdminLoginReq adminLoginReq) {
        return adminService.adminSignIn(adminLoginReq);
    }
    @PostMapping("/signout")
    public ResponseEntity<?> adminLogout(
            @RequestHeader(value = "Authorization", required = false) String authHeader)
    {
        return adminService.logout(authHeader);
    }

}
