package com.foodfusion.app.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String role; // CUSTOMER, OWNER, DELIVERY, ADMIN
    private LocalDate birthday;
}
