package com.yum.foodyy.Controller;

import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Entity.DTO.ForgotPasswordReq;
import com.yum.foodyy.Repo.ForgotPasswordRepo;
import com.yum.foodyy.Service.CustomerService;
import com.yum.foodyy.Service.EmailService;
import com.yum.foodyy.Service.ForgotPasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/forgot-password/")
public class ForgotPasswordController {

    @Autowired private CustomerService customerService;
    @Autowired private EmailService emailService;
    @Autowired private ForgotPasswordRepo forgotPasswordRepo;
    @Autowired private ForgotPasswordService forgotPasswordService;

    @PostMapping("/verify-email/{email}")
    public ResponseEntity<String> verifyEmail(@PathVariable String email){
        CustomerInfo customer = customerService
                                    .getCustByEmail(email)
                                    .orElseThrow(() -> new UsernameNotFoundException("Please provide valid email"));

        if(customer != null){
            return forgotPasswordService.emailVerification(email);
        }else{
            return new ResponseEntity<>("Please provide a valid Email Id!", HttpStatus.EXPECTATION_FAILED);
        }
    }

    //OTP Verification
    @PostMapping("/verify-otp/{otp}/{email}")
    public ResponseEntity<String> verifyOtp(
            @PathVariable Integer otp,
            @PathVariable String email){
        CustomerInfo customer = customerService
                                .getCustByEmail(email)
                                .orElseThrow( () -> new UsernameNotFoundException("No customer with this email id is registered"));

        if(customer == null){
            return new ResponseEntity<>("Please provide a valid Email Id!", HttpStatus.EXPECTATION_FAILED);
        }

        return forgotPasswordService.otpVerification(otp,email);

    }

    @PostMapping("/change-password/{email}")
    public ResponseEntity<String> changePassword(
            @RequestBody ForgotPasswordReq forgotPasswordReq,
            @PathVariable String email) {

        CustomerInfo customer = customerService.getCustByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Email not found"));

        try {
            forgotPasswordService.updatePasswordAndCleanUp(email, forgotPasswordReq.password());
            return ResponseEntity.ok("Password changed successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Session expired or invalid", HttpStatus.EXPECTATION_FAILED);
        }
    }
}
