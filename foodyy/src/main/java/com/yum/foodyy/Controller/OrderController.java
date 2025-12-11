package com.yum.foodyy.Controller;

import com.yum.foodyy.Entity.DTO.OrderRequest;
import com.yum.foodyy.Entity.DTO.OrderResponse;
import com.yum.foodyy.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("{custId}/order/place")
    public ResponseEntity<?> placeOrder(@PathVariable int custId, @RequestBody OrderRequest orderRequest){
        try {
            OrderResponse orderResponse = orderService.addOrder(custId, orderRequest);
            return new ResponseEntity<>(orderResponse, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/customer/{custId}/orders")
    public ResponseEntity<?> getCustomerOrders(@PathVariable int custId){
        try {
            List<OrderResponse> orderResponseList = orderService.getOrdersByCustomer(custId);
            return ResponseEntity.ok(orderResponseList);
        } catch (Exception e){
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders(){
        return new ResponseEntity<>(orderService.allOrders(), HttpStatus.OK);
    }

    @PutMapping("admin/orders/order/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status
    ){
        OrderResponse updateOrder = orderService.updateOrderStatus(orderId,status);
        return ResponseEntity.ok(updateOrder);
    }
}