package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.Cart;
import com.yum.foodyy.Entity.CartItem;
import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Entity.Food;
import com.yum.foodyy.Repo.CartItemRepo;
import com.yum.foodyy.Repo.CartRepo;
import com.yum.foodyy.Repo.CustomerRepo;
import com.yum.foodyy.Repo.FoodRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepo cartRepo;
    @Autowired
    private CustomerRepo customerRepo;
    @Autowired
    private FoodRepo foodRepo;
    @Autowired
    private CartItemRepo cartItemRepo;


    public Cart getCartByCustomer(Integer customerId) {
        CustomerInfo customerInfo = customerRepo.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        return cartRepo.findByCustomerInfo(customerInfo)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
    }

    public Cart addItemToCart(Integer customerId, Integer foodId, Integer quantity) {
        CustomerInfo customerInfo = customerRepo
                .findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        Food food = foodRepo
                .findById(foodId)
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));

        Cart cart = cartRepo.findByCustomerInfo(customerInfo)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setCustomerInfo(customerInfo);
                    return cartRepo.save(newCart);
                });
        Optional<CartItem> existingItem = cart
                                            .getCartItems()
                                            .stream()
                                            .filter(item -> item.getFood().getId().equals(foodId))
                                            .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setFood(food);
            newItem.setQuantity(quantity);
            newItem.setPriceAtTimeOfAddition(food.getPrice());
            cart.getCartItems().add(newItem);
        }

        return cartRepo.save(cart);
    }

    public boolean updateCartItemQuantity(Integer customerId , Integer cartItemId, int quantity) {
        Optional<CartItem> cartItem = cartItemRepo.findById(cartItemId);

        if(cartItem.isEmpty()) return false;

        CartItem item = cartItem.get();

        //we are verifying if this cartItem belongs to the customer or not
        if(!item.getCart().getCustomerInfo().getCustomerId().equals(customerId)){
            return false;
        }
        item.setQuantity(quantity);
        cartItemRepo.save(item);
        return true;
    }


    public boolean deleteCartItem(Integer customerId, Integer cartItemId) {
        Optional<CartItem> cartItemOpt = cartItemRepo.findById(cartItemId);

        if (cartItemOpt.isEmpty()) {
            return false;
        }

        CartItem cartItem = cartItemOpt.get();

        if (!cartItem.getCart().getCustomerInfo().getCustomerId().equals(customerId)) {
            return false;
        }

        cartItemRepo.delete(cartItem);
        return true;
    }

    public void deleteCart(Integer cartId) {
        cartRepo.deleteById(cartId);
        return;
    }
}
