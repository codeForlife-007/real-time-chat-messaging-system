package com.chat_backend.controller;

import com.chat_backend.dto.MessageDto;
import com.chat_backend.model.Message;
import com.chat_backend.service.MessageService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("message")
@AllArgsConstructor
public class MessageController {

    private MessageService messageService;

    @PostMapping("create")
    public ResponseEntity<Message> createMessage(@Valid @RequestBody MessageDto messageDto) {
        return ResponseEntity.ok(messageService.createMessage(messageDto));
    }

    @GetMapping("get/filtered/{senderId}/{receiverId}")
    public ResponseEntity<List<Message>> getConversion(@PathVariable long senderId, @PathVariable long receiverId) {
        return ResponseEntity.ok(messageService.getConversion(senderId, receiverId));
    }

    @GetMapping("{id}/unread")
    public ResponseEntity<Integer> getUnreadMessagesOfReceiverCount(@PathVariable long id) {
        return ResponseEntity.ok(messageService.getUnreadMessagesOfReceiverCount(id));
    }

    @GetMapping("get-all")
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }
}
