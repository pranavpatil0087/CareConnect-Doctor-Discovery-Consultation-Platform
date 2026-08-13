package com.careconnect.service;

import com.careconnect.entity.Otp;
import com.careconnect.exception.BadRequestException;
import com.careconnect.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.ZonedDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private final OtpRepository otpRepository;
    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();

    public String generateOtpCode() {
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }

    @Transactional
    public String sendOtp(String contact, String method) {
        String code = generateOtpCode();
        ZonedDateTime expiresAt = ZonedDateTime.now().plusMinutes(5);

        Otp otp = Otp.builder()
                .contact(contact)
                .code(code)
                .isVerified(false)
                .expiresAt(expiresAt)
                .build();

        otpRepository.save(otp);

        if ("email".equalsIgnoreCase(method) || contact.contains("@")) {
            sendEmailOtp(contact, code);
        } else {
            sendSmsOtp(contact, code);
        }

        return code;
    }

    private void sendEmailOtp(String toEmail, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("CareConnect - Verification OTP Code");
            message.setText("Your CareConnect verification code is: " + code + "\nValid for 5 minutes.");
            mailSender.send(message);
            log.info("OTP sent via email to {}", toEmail);
        } catch (Exception ex) {
            log.warn("Could not send email OTP to {}. Local Dev OTP Code: {}", toEmail, code);
        }
    }

    private void sendSmsOtp(String phoneNumber, String code) {
        log.info("Simulating AWS SNS SMS dispatch to {}. OTP Code: {}", phoneNumber, code);
    }

    @Transactional
    public boolean verifyOtp(String contact, String code) {
        Optional<Otp> otpOptional = otpRepository.findTopByContactAndCodeAndIsVerifiedFalseOrderByCreatedAtDesc(contact, code);

        if (otpOptional.isEmpty()) {
            throw new BadRequestException("Invalid or expired OTP code");
        }

        Otp otp = otpOptional.get();
        if (ZonedDateTime.now().isAfter(otp.getExpiresAt())) {
            throw new BadRequestException("OTP code has expired");
        }

        otp.setIsVerified(true);
        otpRepository.save(otp);
        return true;
    }
}
