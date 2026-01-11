package com.yum.foodyy.Service;

import com.yum.foodyy.Entity.DTO.MailBody;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService{


    @Autowired private JavaMailSender javaMailSender;

    public void sendSimpleMessage(MailBody mailBody){
        SimpleMailMessage mailMessage = new SimpleMailMessage();

        mailMessage.setTo(mailBody.to());
        mailMessage.setFrom("harshbais87@gmail.com");
        mailMessage.setSubject(mailBody.subject());
        mailMessage.setText(mailBody.text());

        javaMailSender.send(mailMessage);
    }
}
