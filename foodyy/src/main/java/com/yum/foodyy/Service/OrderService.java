package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.*;
import com.yum.foodyy.Entity.DTO.OrderItemResponse;
import com.yum.foodyy.Entity.DTO.OrderRequest;
import com.yum.foodyy.Entity.DTO.OrderResponse;
import com.yum.foodyy.Repo.CartItemRepo;
import com.yum.foodyy.Repo.CartRepo;
import com.yum.foodyy.Repo.CustomerRepo;
import com.yum.foodyy.Repo.OrderRepo;
import jakarta.transaction.Transactional; // Important for data integrity
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired private OrderRepo orderRepo;
    @Autowired private CustomerRepo customerRepo;
    @Autowired private CartRepo cartRepo;
    @Autowired private CartItemRepo cartItemRepo;

    @Transactional
    public OrderResponse addOrder(int customerId, OrderRequest orderRequest) {

        //getting customer
        CustomerInfo customerInfo = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

//        getting items from cart of the customer using his ID
        List<CartItem> cartItems = cartItemRepo.findByCart_CustomerInfo_CustomerId(customerId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty. Cannot place order.");
        }

//        so here we are setting the order
        CustomerOrder order = new CustomerOrder();
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0,8).toUpperCase();

        order.setOrderId(orderId);
        order.setCustomerInfo(customerInfo);
        order.setEmail(customerInfo.getEmail());
        order.setAddress(orderRequest.address());
        order.setStatus("PLACED");
        order.setOrderDate(LocalDateTime.now());

//        to set orderItems in order we have to first set cart items in orderItems then the list will be added to order
        List<CustomerOrderItems> orderItems = new ArrayList<>();
        BigDecimal grandTotal = BigDecimal.ZERO;

        for(CartItem cartItem : cartItems){
            Food food = cartItem.getFood();
            int qty = cartItem.getQuantity();

            BigDecimal lineTotal = food.getPrice().multiply(BigDecimal.valueOf(qty));

//            creating CustomerOrderItems and adding it into list
            CustomerOrderItems orderItem = CustomerOrderItems.builder()
                    .food(food)
                    .quantity(qty)
                    .totalPrice(lineTotal)
                    .order(order)
                    .build();

            orderItems.add(orderItem);

            grandTotal = grandTotal.add(lineTotal);
        }

        order.setOrderItems(orderItems); // orderItems added in Order
        order.setTotalAmount(grandTotal);

//        so till now we just stored the data locally but now we are going to save it in database use repo class
        CustomerOrder savedOrder = orderRepo.save(order);

        cartItemRepo.deleteAll(cartItems); // clearing the cart after placing order

//        this is list of OrderItemResponse we will send to OrderResponse which we will return
        List<OrderItemResponse> itemResponses = savedOrder.getOrderItems()
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getFood().getName(),
                        item.getQuantity(),
                        item.getTotalPrice()))
                .toList();

//        this is the OrderResponse we will send for the OrderRequest we got
        return new OrderResponse(
                savedOrder.getOrderId(),
                savedOrder.getCustomerInfo().getName(),
                savedOrder.getEmail(),
                savedOrder.getAddress(),
                savedOrder.getStatus(),
                savedOrder.getOrderDate(),
                savedOrder.getTotalAmount(),
                itemResponses
        );
    }

    public List<OrderResponse> getOrdersByCustomer(int custId) {
        //we are asking for orders with customer id (cust id) from our og table and order them by descending order
        List<CustomerOrder> customerOrders = orderRepo.findByCustomerInfo_CustomerIdOrderByOrderDateDesc(custId);

//        basically we are using customerOrders to iterate over all the orders of this customer and for
//        each order we are creating resopnse of their orderItems so that we can add that into our OrderResponse and return it
        return  customerOrders.stream().map( order -> {
            List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                    .map(item -> new OrderItemResponse(
                            item.getFood().getName(),
                            item.getQuantity(),
                            item.getTotalPrice()
                    )).toList();

            return new OrderResponse(
                    order.getOrderId(),
                    order.getCustomerInfo().getName(),
                    order.getEmail(),
                    order.getAddress(),
                    order.getStatus(),
                    order.getOrderDate(),
                    order.getTotalAmount(),
                    itemResponses
            );
        }).toList();
    }

    public List<OrderResponse> allOrders() {
        List<CustomerOrder> orders = orderRepo.findAll(Sort.by(Sort.Direction.DESC, "orderDate"));
        return orders.stream().map(this::mapToDTO).toList();
    }


    public OrderResponse updateOrderStatus(String orderId, String status) {
        CustomerOrder order = orderRepo.findByOrderId(orderId);

        if(order == null) throw new RuntimeException("Order not found");

        order.setStatus(status.toUpperCase());
        orderRepo.save(order);

        return mapToDTO(order);
    }

    private OrderResponse mapToDTO(CustomerOrder customerOrder) {
        List<OrderItemResponse> orderItemResponses = customerOrder.getOrderItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getFood().getName(),
                        item.getQuantity(),
                        item.getTotalPrice()
                )).toList();

        return  new OrderResponse(
                customerOrder.getOrderId(),
                customerOrder.getCustomerInfo().getName(),
                customerOrder.getEmail(),
                customerOrder.getAddress(),
                customerOrder.getStatus(),
                customerOrder.getOrderDate(),
                customerOrder.getTotalAmount(),
                orderItemResponses
        );
    }
}