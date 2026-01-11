package com.yum.foodyy.Controller;

import com.yum.foodyy.Entity.Cart;
import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Service.CartService;
import com.yum.foodyy.Service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    @Autowired
    private CartService cartService;
    @Autowired private CustomerService customerService;

    @GetMapping("/{custId}")
    public ResponseEntity<?> getCart(@PathVariable Integer custId){
        Cart cart = cartService.getCartByCustomer(custId);

        if(cart == null){
            Cart emptyCart = new Cart();
            CustomerInfo customerInfo = customerService.getCustById(custId)
                    .orElseThrow(() -> new UsernameNotFoundException("No such user exist"));

            emptyCart.setCartItems(new ArrayList<>());
            emptyCart.setCreatedAt(LocalDateTime.now());
            emptyCart.setCustomerInfo(customerInfo);
            return ResponseEntity.ok(emptyCart);
        }

        return ResponseEntity.ok(cart);
    }

    @PostMapping("/{custId}/add")
    public ResponseEntity<?> addToCart(@PathVariable Integer custId, @RequestParam Integer foodId, @RequestParam(defaultValue = "1") Integer quantity){

        try{
            Cart updatedCart = cartService.addItemToCart(custId, foodId, quantity);
            return ResponseEntity.ok(updatedCart);
        }catch (IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }catch (Exception e){
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding to cart");
        }
    }

    @PutMapping("/update/{custId}/{cartItemId}")
    public ResponseEntity<?> updateCart(
            @PathVariable Integer custId,
            @PathVariable Integer cartItemId,
            @RequestBody Map<String, Integer> body
            ){

        Integer quantity = body.get("quantity");

        if(quantity == null || quantity <= 0){
            return new ResponseEntity<>("Quantity must be greater than 0", HttpStatus.BAD_REQUEST);
        }

        boolean update = cartService.updateCartItemQuantity(custId,cartItemId,quantity);

        if(!update){
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Cart item not found or does not belong to this customer");
        }

        return ResponseEntity.ok("Cart quantity updated");
    }

    @DeleteMapping("/remove/{custId}/{cartItemId}")
    public ResponseEntity<?> deleteCartItem(
            @PathVariable Integer custId,
            @PathVariable Integer cartItemId
    ){
        boolean deleted = cartService.deleteCartItem(custId, cartItemId);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Cart item not found or does not belong to this customer");
        }

        return ResponseEntity.ok("Item removed from the cart");
    }
}
