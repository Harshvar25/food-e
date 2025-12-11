package com.yum.foodyy.Controller;

import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Entity.DTO.LoginRequest;
import com.yum.foodyy.Service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

    @Autowired
    private CustomerService customerService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/customer/signup")
    public ResponseEntity<?> customerSignUp(@RequestPart("customer") CustomerInfo customerInfo, @RequestPart(value = "image", required = false) MultipartFile imageFile) throws IOException {
        return customerService.signUp(customerInfo, imageFile);
    }


    @PostMapping("/customer/signin")
    public ResponseEntity<?> customerSignIn(@RequestBody LoginRequest loginRequest) {
        return customerService.signIn(loginRequest);
    }

    @PostMapping("/customer/signout")
    public ResponseEntity<?> customerLogout(
            @RequestHeader(value = "Authorization", required = false) String authHeader){
        return customerService.logout(authHeader);
    }

    @GetMapping({"/admin/customer/{custId}" , "/customer/{custId}"})
    public ResponseEntity<?> getCustomer(@PathVariable Integer custId) {
        Optional<CustomerInfo> customer = customerService.getCustById(custId);
        if (customer.isPresent()) {
            return ResponseEntity.ok(customer.get());
        } else {
            return ResponseEntity.status(404).body("Customer not found");
        }
    }

    @GetMapping("admin/customers")
    public ResponseEntity<?> getAllCustomers(){
        List<CustomerInfo> customers = customerService.getAllCustomers();

        if(customers.isEmpty()){
            return new ResponseEntity<>("No Customer Found.", HttpStatus.NOT_FOUND);
        }

        return ResponseEntity.ok(customers);
    }

    @PostMapping("admin/customer/")
    public ResponseEntity<?> addCustomer(@RequestPart CustomerInfo customer, @RequestPart MultipartFile imageFile) throws IOException {

        CustomerInfo customerInfo = customerService.addOrUpdateCustomer(customer,imageFile);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("Message","Customer added successfully","data",customerInfo));
    }

    @PutMapping({"admin/customer/{cusId}", "customer/{cusId}"})
    public ResponseEntity<?> updateCustomer(
            @PathVariable int cusId,
            @RequestPart CustomerInfo customer,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws IOException {

        Optional<CustomerInfo> current = customerService.getCustById(cusId);

        if(current.isEmpty()){
            return new ResponseEntity<>("Customer not found !!",HttpStatus.NOT_FOUND);
        }
        customer.setCustomerId(cusId);
        CustomerInfo updated = customerService.addOrUpdateCustomer(customer,imageFile);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping({"admin/customer/{id}" , "customer/{id}"})
    public ResponseEntity<String> deleteCustomer(@PathVariable int id){
        Optional<CustomerInfo> customer = customerService.getCustById(id);

        if(customer.isPresent()){
            String custName = customer.get().getName();
            customerService.deleteCustomer(id);
            return new ResponseEntity<>(custName + "'s account deleted successfully" , HttpStatus.OK);
        }

        return new ResponseEntity<>("Customer/Account not found", HttpStatus.NOT_FOUND);
    }

    @GetMapping({"admin/customers/search"})
    public ResponseEntity<List<CustomerInfo>> searchCustomer(@RequestParam String keyword){
        List<CustomerInfo> customers = customerService.searchCustomer(keyword);
        return ResponseEntity.ok(customers);
    }

}
