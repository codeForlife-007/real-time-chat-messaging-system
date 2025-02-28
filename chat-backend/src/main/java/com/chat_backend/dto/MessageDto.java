package com.chat_backend.dto;

import com.chat_backend.annotation.NotEqualIds;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@NotEqualIds
public class MessageDto {

    @NotNull(message = "sender id cannot be null")
    @Positive(message = "sender id should be positive")
    private Long senderId;

    @NotNull(message = "receiver id cannot be null")
    @Positive(message = "receiver id should be positive")
    private Long receiverId;

    @NotBlank(message = "message cannot be blank")
    private String message;
}
