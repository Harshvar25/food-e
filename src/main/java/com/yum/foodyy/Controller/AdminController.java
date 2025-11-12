package com.yum.foodyy.Controller;

import com.yum.foodyy.Entity.Admin;
import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Entity.Food;
import com.yum.foodyy.Service.AdminService;
import com.yum.foodyy.Service.CustomerService;
import com.yum.foodyy.Service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private FoodService foodService;

    @Autowired
    private CustomerService customerService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/signin")
    public ResponseEntity<String> adminSignIn(@RequestBody Admin admin) {
        Optional<Admin> existingAdmin = adminService.getAdminByUsername(admin.getUsername());

        if (existingAdmin.isPresent()) {
            Admin found = existingAdmin.get();
            if (passwordEncoder.matches(admin.getPassword(), found.getPassword())) {
                return ResponseEntity.ok("Login successful");
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerInfo>> getAllCustomers() {
        List<CustomerInfo> customers = customerService.getAllCustomers();
        return new ResponseEntity<>(customers, HttpStatus.OK);
    }

    @GetMapping("customer/{custId}")
    public ResponseEntity<?> getCustomer(@PathVariable int custId){
        Optional<CustomerInfo> customerInfo = customerService.getCustById(custId);
        return new ResponseEntity<>(customerInfo,HttpStatus.OK);
    }

    @PostMapping("/customer")
    public ResponseEntity<CustomerInfo> addCustomer(@RequestBody CustomerInfo customer) {
        CustomerInfo saved = customerService.addOrUpdateCustomer(customer);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/customer/{cusId}")
    public ResponseEntity<?> updateCustomer(@PathVariable int cusId, @RequestBody CustomerInfo customer) {
        Optional<CustomerInfo> existing = customerService.getCustById(cusId);
        if (existing.isEmpty()) {
            return new ResponseEntity<>("Customer not found", HttpStatus.NOT_FOUND);
        }
        customer.setCustomerId(cusId);
        CustomerInfo updated = customerService.addOrUpdateCustomer(customer);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/customer/{id}")
    public ResponseEntity<String> deleteCustomer(@PathVariable int id) {
        Optional<CustomerInfo> customer = customerService.getCustById(id);
        if (customer.isPresent()) {
            customerService.deleteCustomer(id);
            return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
        }
        return new ResponseEntity<>("Customer not found", HttpStatus.NOT_FOUND);
    }

    @GetMapping("/customers/search")
    public ResponseEntity<List<CustomerInfo>> searchCustomer(@RequestParam String keyword) {
        List<CustomerInfo> customers = customerService.searchCustomer(keyword);
        return new ResponseEntity<>(customers, HttpStatus.OK);
    }

    @GetMapping("/foods")
    public ResponseEntity<List<Food>> getAllFoods() {
        List<Food> foods = foodService.getAllFoods();
        return new ResponseEntity<>(foods, HttpStatus.OK);
    }

    @GetMapping("food/{foodId}")
    public ResponseEntity<?> getFood(@PathVariable int foodId){
        Optional<Food> food = foodService.getFoodById(foodId);
        return new ResponseEntity<>(food,HttpStatus.OK);
    }

    @PostMapping("/food")
    public ResponseEntity<?> addFood(@RequestBody Food food) {
        try {
            Food saved = foodService.addOrUpdateProduct(food);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Food added successfully", "data", saved));

        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/food/{foodId}")
    public ResponseEntity<?> updateFood(@PathVariable int foodId, @RequestBody Food food) {
        Optional<Food> existing = foodService.getFoodById(foodId);
        if (existing.isEmpty()) {
            return new ResponseEntity<>("Food not found", HttpStatus.NOT_FOUND);
        }
        food.setId(foodId);
        Food updated = foodService.addOrUpdateProduct(food);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/food/{foodId}")
    public ResponseEntity<String> deleteFood(@PathVariable int foodId) {
        Optional<Food> food = foodService.getFoodById(foodId);
        if (food.isPresent()) {
            foodService.deleteFood(foodId);
            return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
        }
        return new ResponseEntity<>("Food not found", HttpStatus.NOT_FOUND);
    }

    @GetMapping("/foods/search")
    public ResponseEntity<List<Food>> searchFood(@RequestParam String keyword) {
        List<Food> foods = foodService.searchFood(keyword);
        return new ResponseEntity<>(foods, HttpStatus.OK);
    }
}
