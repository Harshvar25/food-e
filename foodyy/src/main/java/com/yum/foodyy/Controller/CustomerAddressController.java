package com.yum.foodyy.Controller;

import com.yum.foodyy.Entity.Address;
import com.yum.foodyy.Service.CustomerAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerAddressController {

    @Autowired private CustomerAddressService customerAddressService;

    @GetMapping("/customer/{custId}/address")
    public ResponseEntity<List<Address>> getAddress(@PathVariable int custId){
        return ResponseEntity.ok(customerAddressService.findByCustomerId(custId));
    }

    @PostMapping("/customer/{custId}/address")
    public ResponseEntity<?> addAddress(@PathVariable int custId, @RequestBody Address address){
        try {
            Address savedAddress = customerAddressService.saveAddressOrUpdate(custId, address);
            return ResponseEntity.ok(savedAddress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving address: " + e.getMessage());
        }
    }

    @PutMapping("/customer/{custId}/profile/address")
    public ResponseEntity<?> editAddress(@PathVariable int custId, @RequestBody Address address){

        //checking if the provided address id exist of not.
        if (address.getId() == null) {
            return ResponseEntity.badRequest().body("Address ID is required for update.");
        }

        //check if the customer exist or not.
        Optional<Address> existing = customerAddressService.getAddress(address.getId());
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        //
        try {
            Address updated = customerAddressService.saveAddressOrUpdate(custId, address);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Update failed");
        }
    }

    @DeleteMapping("customer/address/{addressId}")
    public ResponseEntity<?> deleteAddress(@PathVariable int addressId){
        //call service to delete address
        boolean isDeleted = customerAddressService.deleteAddress(addressId);
        //check if deleted or not
        if (isDeleted) {
            return ResponseEntity.ok("Address deleted successfully");
        } else {
            return ResponseEntity.status(404).body("Address not found");
        }
    }
}