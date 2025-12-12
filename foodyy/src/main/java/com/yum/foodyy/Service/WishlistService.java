package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Entity.Food;
import com.yum.foodyy.Entity.Wishlist;
import com.yum.foodyy.Repo.CustomerRepo;
import com.yum.foodyy.Repo.FoodRepo;
import com.yum.foodyy.Repo.WishlistRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private CartService cartService;
    @Autowired
    private CustomerRepo customerRepo;
    @Autowired
    private FoodRepo foodRepo;
    @Autowired
    private WishlistRepo wishlistRepo;

    public void addWish(Integer customerID, Integer foodID) {
        CustomerInfo customerInfo = customerRepo.findById(customerID)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        Food food = foodRepo.findById(foodID)
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));

        if (wishlistRepo.existsByCustomerInfoAndFood(customerInfo, food)) {
            return;
        }

        Wishlist wishlist  = new Wishlist();
        wishlist.setCustomerInfo(customerInfo);
        wishlist.setFood(food);
        wishlistRepo.save(wishlist);
    }

    public List<Wishlist> getWishlistByCustomerId(Integer customerId) {
        CustomerInfo customerInfo = customerRepo.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        return wishlistRepo.findByCustomerInfo_CustomerId(customerId);
    }

    @Transactional
    public void moveToCart(Integer wishlistId) {

        Wishlist wishlistItem = wishlistRepo.findById(wishlistId)
                .orElseThrow(() -> new IllegalArgumentException("Wishlist item not found"));

        Integer customerId = wishlistItem.getCustomerInfo().getCustomerId();
        Integer foodId = wishlistItem.getFood().getId();
        Integer quantity = 1;

        cartService.addItemToCart(customerId, foodId, quantity);

        wishlistRepo.delete(wishlistItem);
    }

    @Transactional
    public void removeWish(Integer customerId, Integer foodId) {
        CustomerInfo customerInfo = customerRepo.findById(customerId).orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        Food food = foodRepo.findById(foodId).orElseThrow(() -> new IllegalArgumentException("Food not found"));

        Wishlist wishlist = (Wishlist) wishlistRepo.findByCustomerInfoAndFood(customerInfo, food).orElseThrow(() -> new IllegalArgumentException("Wishlist not found"));

                if(wishlist != null){
                    wishlistRepo.delete(wishlist);
                }
    }
}
