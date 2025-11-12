package com.yum.foodyy.Controller;

import com.yum.foodyy.Entity.Cart;
import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Service.CartService;
import com.yum.foodyy.Service.CustomerService;
import com.yum.foodyy.Service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/customer")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

    @Autowired
    private CustomerService customerService;
    @Autowired
    private FoodService foodService;
    @Autowired
    private CartService cartService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> customerSignUp(@RequestBody CustomerInfo customerInfo) {

        Optional<CustomerInfo> existingByEmail = customerService.getCustByEmail(customerInfo.getEmail());
        if (existingByEmail.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email already registered");
        }

        Optional<CustomerInfo> existingByPhone = customerService.getCustByPhone(customerInfo.getPhone());
        if (existingByPhone.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Phone number already registered");
        }

        customerInfo.setPassword(passwordEncoder.encode(customerInfo.getPassword()));

        CustomerInfo savedCustomer = customerService.addOrUpdateCustomer(customerInfo);

        savedCustomer.setPassword(null);
        return new ResponseEntity<>(savedCustomer, HttpStatus.CREATED);
    }


    @PostMapping("/signin")
    public ResponseEntity<String> customerSignIn(@RequestBody CustomerInfo customer) {
        Optional<CustomerInfo> existingCustomer = customerService.getCustByEmail(customer.getEmail());

        if (existingCustomer.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
        }

        CustomerInfo found = existingCustomer.get();

        if (passwordEncoder.matches(customer.getPassword(), found.getPassword())) {
            return ResponseEntity.ok("Login successful");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }
    }

    @GetMapping("/foods")
    public ResponseEntity<?> getAllFoods() {
        return ResponseEntity.ok(foodService.getAllFoods());
    }

    @GetMapping("/foods/{id}")
    public ResponseEntity<?> getFoodById(@PathVariable Integer id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @GetMapping("/cart/{custId}")
    public ResponseEntity<?> getCart(@PathVariable Integer custId) {
        Cart cart = cartService.getCartByCustomer(custId);
        if (cart == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart not found");
        }
        return ResponseEntity.ok(cart);
    }


    @PostMapping("/{customerId}/cart/add")
    public ResponseEntity<?> addFoodToCart(
            @PathVariable Integer customerId,
            @RequestParam Integer foodId,
            @RequestParam(defaultValue = "1") Integer quantity) {

        try {
            Cart updatedCart = cartService.addItemToCart(customerId, foodId, quantity);
            return ResponseEntity.ok(updatedCart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding to cart");
        }
    }

    @PutMapping("/cart/update/{customerId}/{cartItemId}")
    public ResponseEntity<?> updateCartItemQuantity(
            @PathVariable Integer customerId,
            @PathVariable Integer cartItemId,
            @RequestBody Map<String, Integer> body) {

        Integer quantity = body.get("quantity");

        if (quantity == null || quantity <= 0) {
            return new ResponseEntity<>("Quantity must be greater than 0", HttpStatus.BAD_REQUEST);
        }

        boolean updated = cartService.updateCartItemQuantity(customerId, cartItemId, quantity);

        if (!updated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Cart item not found or does not belong to this customer");
        }

        return ResponseEntity.ok("Quantity updated successfully");
    }



    @DeleteMapping("/cart/remove/{customerId}/{cartItemId}")
    public ResponseEntity<?> deleteCartItem(
            @PathVariable Integer customerId,
            @PathVariable Integer cartItemId) {

        boolean deleted = cartService.deleteCartItem(customerId, cartItemId);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Cart item not found or does not belong to this customer");
        }

        return ResponseEntity.ok("Item deleted successfully");
    }

}
