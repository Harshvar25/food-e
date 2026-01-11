package com.yum.foodyy.Repo;

import com.yum.foodyy.Entity.CustomerInfo;
import com.yum.foodyy.Entity.ForgotPassword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForgotPasswordRepo extends JpaRepository<ForgotPassword, Integer> {

    @Query("SELECT fp FROM ForgotPassword fp WHERE fp.customerInfo.customerId = :cusId")
    Optional<ForgotPassword> findByCustomerId(@Param("cusId") Integer cusId);

    Optional<ForgotPassword> findByOtpAndCustomerInfo(Integer otp, CustomerInfo customer);
}
