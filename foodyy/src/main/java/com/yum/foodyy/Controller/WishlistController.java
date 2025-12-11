package com.yum.foodyy.Controller;

import com.yum.foodyy.Entity.Wishlist;
import com.yum.foodyy.Service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("customer/wishlist")
@CrossOrigin(origins = "http://localhost:3000")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(@RequestParam Integer customerId, @RequestParam Integer foodId){
        wishlistService.addWish(customerId,foodId);
        return ResponseEntity.ok("Added to Wishlist");
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromWishlist(@RequestParam Integer customerId, @RequestParam Integer foodId){
        wishlistService.removeWish(customerId,foodId);
        return ResponseEntity.ok("Removed from the list");
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<List<Wishlist>> getWishList(@PathVariable Integer customerId){
        return ResponseEntity.ok(wishlistService.getWishlistByCustomerId(customerId));
    }

    @PostMapping("/move-to-cart/{wishlistId}")
    public ResponseEntity<?>  moveToCart(@PathVariable Integer wishlistId){
        wishlistService.moveToCart(wishlistId);
        return ResponseEntity.ok("Moved to cart");
    }
}
