package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.Admin;
import com.yum.foodyy.Entity.DTO.AdminLoginReq;
import com.yum.foodyy.Repo.AdminRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepo adminRepo;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    public Optional<Admin> getAdminByUsername(String username) {
        return Optional.ofNullable(adminRepo.findByUsername(username));
    }

    public ResponseEntity<?> adminSignIn(AdminLoginReq loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails.getUsername());

            Map<String,Object> body = new HashMap<>();
            body.put("message", "Login successful");
            body.put("token",token);
            body.put("tokenType","Bearer");

            return ResponseEntity.ok(body);
        }catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Authentication failed", "details", ex.getMessage()));
        }
    }

    public ResponseEntity<String> logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Token missing or invalid");
        }

        String token = authHeader.substring(7);
        tokenBlacklistService.blacklistToken(token);

        if(tokenBlacklistService.isBlacklisted(token)){
            System.out.println("Token blacklisted");
        }
        return ResponseEntity.ok("Admin logout successful");
    }
}
