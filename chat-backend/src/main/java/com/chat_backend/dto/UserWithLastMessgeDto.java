package com.chat_backend.dto;

import lombok.Data;

@Data
public class UserWithLastMessgeDto {

    private Long id;

    private Long lastMessageSenderId;

    private String name;

    private String email;

    private String phoneNo;

    private boolean offline;

    private String lastMessage;

    private String lastMessageSentAt;
}
