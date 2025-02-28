package com.chat_backend.service;

import com.chat_backend.dto.MessageDto;
import com.chat_backend.exception.ChatException;
import com.chat_backend.exception.NotFoundException;
import com.chat_backend.model.Message;
import com.chat_backend.model.User;
import com.chat_backend.repository.MessageRepo;
import com.chat_backend.repository.UserRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MessageService {

    private MessageRepo messageRepo;
    private UserRepo userRepo;

    public Message createMessage(MessageDto messageDto) {
        User sender = userRepo.findById(messageDto.getSenderId()).orElseThrow(() -> new NotFoundException("Sender not found " + messageDto.getSenderId()));
        if (sender.isOffline()) {
            throw new ChatException("Sender is offline");
        }
        User receiver = userRepo.findById(messageDto.getReceiverId()).orElseThrow(() -> new NotFoundException("Receiver not found " + messageDto.getReceiverId()));
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setMessageText(messageDto.getMessage());
        return messageRepo.save(message);
    }

    public List<Message> getConversion(long senderId, long receiverId) {
        return messageRepo.findConversation(senderId, receiverId).orElseThrow(() -> new NotFoundException("No message are found"));
    }

    public Integer getUnreadMessagesOfReceiverCount(long id) {
        List<Message> unreadMessages = messageRepo.findByReceiverIdAndDeliveredFalse(id).orElseThrow(() -> new NotFoundException("User not found with id " + id));
        Integer unreadMessageCount = 0;
        for (Message message : unreadMessages) {
            unreadMessageCount++;
        }
        return unreadMessageCount;
    }

    public List<Message> getAllMessages() {
        return messageRepo.findAll();
    }
}
