package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Entity.DTO.MailBody;
import com.yum.foodyy.Entity.ForgotPassword;
import com.yum.foodyy.Repo.CustomerRepo;
import com.yum.foodyy.Repo.ForgotPasswordRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Random;

@Service
public class ForgotPasswordService {

    @Autowired private ForgotPasswordRepo forgotPasswordRepo;
    @Autowired private EmailService emailService;
    @Autowired private CustomerRepo customerRepo;
    @Autowired private PasswordEncoder passwordEncoder;


    public ResponseEntity<String> emailVerification(String email) {

        CustomerInfo customer = customerRepo.findByEmail(email);

        //deleting the previous OTP if it exists
        forgotPasswordRepo
                .findByCustomerId(customer.getCustomerId())
                .ifPresent(oldfp -> {
                    customer.setForgotPassword(null);
                    forgotPasswordRepo.delete(oldfp);
                    forgotPasswordRepo.flush();
                });

        int otp = otpGenerator();

        MailBody mailBody = MailBody
                .builder()
                .to(email)
                .subject("OTP for forgot password request !")
                .text("Here is the OTP as per requested by the user" + otp)
                .build();

        ForgotPassword forgotPassword = ForgotPassword
                .builder()
                .otp(otp)
                .expiration(new Date(System.currentTimeMillis() + 70 * 1000 ))
                .customerInfo(customer)
                .build();

        emailService.sendSimpleMessage(mailBody);
        forgotPasswordRepo.save(forgotPassword);

        return  ResponseEntity.ok("OTP sent on email. Kindly check !!");
    }

    public ResponseEntity<String> otpVerification(Integer otp, String email) {
        CustomerInfo customer = customerRepo.findByEmail(email);

        ForgotPassword forgotPassword = forgotPasswordRepo
                                        .findByOtpAndCustomerInfo(otp,customer)
                                        .orElseThrow(() -> new UsernameNotFoundException("Please provide valid OTP"));

//        if OTP is expired then delete/remove it from the database
        if(forgotPassword.getExpiration().before(Date.from(Instant.now()))){
            forgotPasswordRepo.deleteById(forgotPassword.getFpid());
            return new ResponseEntity<>("OTP has been expired!", HttpStatus.EXPECTATION_FAILED);
        }
        return ResponseEntity.ok("OTP verified");
    }

    @Transactional
    public void updatePasswordAndCleanUp(String email, String newPass) {

        CustomerInfo customerInfo = customerRepo.findByEmail(email);
        if (customerInfo == null) {
            throw new UsernameNotFoundException("Customer not found with email: " + email);
        }

        ForgotPassword fp = forgotPasswordRepo.findByCustomerId(customerInfo.getCustomerId())
                .orElseThrow(() -> new RuntimeException("OTP session expired or not found"));


        customerInfo.setPassword(passwordEncoder.encode(newPass));
        customerInfo.setForgotPassword(null);
        customerRepo.save(customerInfo);

    }

    private Integer otpGenerator(){
        Random random = new Random();
        return random.nextInt(10_00, 99_99);
    }

}
