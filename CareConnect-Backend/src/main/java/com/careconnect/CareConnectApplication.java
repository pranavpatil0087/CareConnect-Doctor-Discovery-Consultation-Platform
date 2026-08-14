package com.careconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CareConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareConnectApplication.class, args);
    }
}
