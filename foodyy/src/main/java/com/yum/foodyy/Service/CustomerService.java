package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.Cart;
import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Entity.DTO.LoginRequest;
import com.yum.foodyy.Entity.DTO.LoginResponse;
import com.yum.foodyy.Repo.CartRepo;
import com.yum.foodyy.Repo.CustomerRepo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CustomerService {

    @Autowired private CustomerRepo customerRepo;
    @Autowired private CartRepo cartRepo;
    @Autowired private CartService cartService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private  TokenBlacklistService tokenBlacklistService;

    public ResponseEntity<?> signUp(CustomerInfo customerInfo, MultipartFile imageFile) throws IOException {

        if (customerRepo.findByEmail(customerInfo.getEmail()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email already registered");
        }

        if (customerRepo.findByPhone(customerInfo.getPhone()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Phone number already registered");
        }

        customerInfo.setPassword(passwordEncoder.encode(customerInfo.getPassword()));

        if (imageFile != null && !imageFile.isEmpty()) {
            customerInfo.setImageType(imageFile.getContentType());
            customerInfo.setImageData(imageFile.getBytes());
            customerInfo.setImageName(imageFile.getOriginalFilename());
        }

        CustomerInfo saved = customerRepo.save(customerInfo);
        Cart cart = new Cart();
        cart.setCustomerInfo(saved);
        cart.setCreatedAt(LocalDateTime.now());
        cartRepo.save(cart);

        // Return DTO (clean & safe)
        Map<String, Object> body = new HashMap<>();
        body.put("customerId", saved.getCustomerId());
        body.put("name", saved.getName());
        body.put("email", saved.getEmail());
        body.put("phone", saved.getPhone());
        body.put("image", saved.getImageData());

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    public ResponseEntity<?> signIn(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails.getUsername());

            CustomerInfo customerInfo = customerRepo.findByEmail(loginRequest.getEmail());

            LoginResponse loginResponse = new LoginResponse(
                    token,
                    customerInfo.getCustomerId(),
                    customerInfo.getName(),
                    customerInfo.getEmail()
            );

            System.out.println(token);
            return ResponseEntity.ok(loginResponse);

        }catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Authentication failed", "details", ex.getMessage()));
        }
    }

    public long count() {
        return customerRepo.count();
    }

    public List<CustomerInfo> getAllCustomers() {
        return customerRepo.findAll();
    }

    @Transactional
    public CustomerInfo addOrUpdateCustomer(CustomerInfo customerInfo, MultipartFile imageFile) throws IOException {

        boolean isUpdate = Objects.nonNull(customerInfo.getCustomerId()) && customerInfo.getCustomerId() > 0;

        if (isUpdate) {
            CustomerInfo existing = customerRepo.findById(customerInfo.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            if (imageFile != null && !imageFile.isEmpty()) {
                customerInfo.setImageName(imageFile.getOriginalFilename());
                customerInfo.setImageType(imageFile.getContentType());
                customerInfo.setImageData(imageFile.getBytes());
            } else {
                customerInfo.setImageName(existing.getImageName());
                customerInfo.setImageType(existing.getImageType());
                customerInfo.setImageData(existing.getImageData());
            }

            if (customerInfo.getPassword() == null || customerInfo.getPassword().isEmpty()) {
                customerInfo.setPassword(existing.getPassword());
            } else {
                customerInfo.setPassword(passwordEncoder.encode(customerInfo.getPassword()));
            }

        } else {
            if (customerInfo.getPassword() != null) {
                customerInfo.setPassword(passwordEncoder.encode(customerInfo.getPassword()));
            }
            if (imageFile != null && !imageFile.isEmpty()) {
                customerInfo.setImageName(imageFile.getOriginalFilename());
                customerInfo.setImageType(imageFile.getContentType());
                customerInfo.setImageData(imageFile.getBytes());
            }
        }

        return customerRepo.save(customerInfo);
    }

    public Optional<CustomerInfo> getCustById(int id) {
        return customerRepo.findById(id);
    }

    public void deleteCustomer(int id) {
        CustomerInfo customerInfo = customerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        try{
            Cart cart = cartService.getCartByCustomer(id);
            if(cart != null){
                cartService.deleteCart(cart.getCartId());
            }
        } catch (Exception e) {
            System.out.println("No cart found for this customer");
        }

        customerRepo.delete(customerInfo);
    }

    public List<CustomerInfo> searchCustomer(String keyword) {
        System.out.println("Searching for keyword: " + keyword);
        return customerRepo.searchCustomer(keyword);
    }

    public Optional<CustomerInfo> getCustByEmail(String email) {
        return Optional.ofNullable(customerRepo.findByEmail(email));
    }

    public Optional<CustomerInfo> getCustByPhone(String phone) {
        return customerRepo.findByPhone(phone);
    }


    public ResponseEntity<?> logout(String authHeader) {
        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            return ResponseEntity.badRequest().body("Token missing or invalid");
        }

        String token = authHeader.substring(7);
        tokenBlacklistService.blacklistToken(token);

        if(tokenBlacklistService.isBlacklisted(token)){
            System.out.println("Customer Token Blacklisted");
        }
        return ResponseEntity.ok("Admin logout successful");
    }

    //verify if current password is correct or not
    public ResponseEntity<?> checkPassword(int id, Map<String, String> request) {
        String currentPassword = request.get("currentPassword");
        CustomerInfo customerInfo = customerRepo.findById(id).orElseThrow();

        try{
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(customerInfo.getEmail(), currentPassword)
            );

            return ResponseEntity.ok(Map.of("message", " Authenticated successfully"));
        }catch (BadCredentialsException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Incorrect Password!! Try again."));
        }
    }
}
