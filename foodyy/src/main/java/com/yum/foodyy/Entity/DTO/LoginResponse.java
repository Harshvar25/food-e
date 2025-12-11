package com.yum.foodyy.Entity.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor // Generates a constructor with all arguments
@NoArgsConstructor  // Generates an empty constructor
public class LoginResponse {
    private String token;
    private Integer id;       // The Customer ID needed for the Cart/Wishlist
    private String name;      // Optional: Good for displaying "Welcome, Alice" in Navbar
    private String email;     // Optional
}