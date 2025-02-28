package com.chat_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserDto {

    @NotBlank(message = "name cannot be blank")
    private String name;

    @NotBlank(message = "email cannot be blank")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "phone no cannot be blank")
    @Pattern(regexp = "^\\+?\\d{1,3}[1-9]\\d{7,13}$", message = "Phone no must be in a valid format (e.g., +1234567890)")
    private String phoneNo;

}
