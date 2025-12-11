package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.Cart;
import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Entity.DTO.LoginRequest;
import com.yum.foodyy.Entity.DTO.LoginResponse;
import com.yum.foodyy.Repo.CustomerRepo;
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
import java.util.*;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepo customerRepo;
    @Autowired
    private CartService cartService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private  TokenBlacklistService tokenBlacklistService;

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

            CustomerInfo customer = customerRepo.findByEmail(loginRequest.getEmail());

            LoginResponse loginResponse = new LoginResponse(
                    token,
                    customer.getCustomerId(),
                    customer.getName(),
                    customer.getEmail()
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
    public CustomerInfo addOrUpdateCustomer(CustomerInfo customer, MultipartFile imageFile) throws IOException {

        boolean isUpdate = Objects.nonNull(customer.getCustomerId()) && customer.getCustomerId() > 0;

        if (isUpdate) {
            Optional<CustomerInfo> existingOpt = customerRepo.findById(customer.getCustomerId());

            if (existingOpt.isPresent()) {
                CustomerInfo existing = existingOpt.get();

                if (imageFile != null && !imageFile.isEmpty()) {
                    customer.setImageName(imageFile.getOriginalFilename());
                    customer.setImageType(imageFile.getContentType());
                    customer.setImageData(imageFile.getBytes());
                } else {
                    customer.setImageName(existing.getImageName());
                    customer.setImageType(existing.getImageType());
                    customer.setImageData(existing.getImageData());
                }

                if (customer.getPassword() == null || customer.getPassword().isEmpty()) {
                    customer.setPassword(existing.getPassword());
                } else {
                    // If it's a new raw password, ensure it's encoded (if not already handled elsewhere)
                    // customer.setPassword(passwordEncoder.encode(customer.getPassword()));
                }
            }
        } else {
            if (imageFile != null && !imageFile.isEmpty()) {
                customer.setImageName(imageFile.getOriginalFilename());
                customer.setImageType(imageFile.getContentType());
                customer.setImageData(imageFile.getBytes());
            }
        }

        return customerRepo.save(customer);
    }

    public Optional<CustomerInfo> getCustById(int id) {
        return customerRepo.findById(id);
    }

    public void deleteCustomer(int id) {
        Optional<CustomerInfo> customer = customerRepo.findById(id);

        if(customer.isPresent()){
            Cart cart = cartService.getCartByCustomer(customer.get().getCustomerId());
            if(cart != null){
                cartService.deleteCart(cart.getCartId());
            }
        }
        customerRepo.deleteById(id);
        return;
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
}
