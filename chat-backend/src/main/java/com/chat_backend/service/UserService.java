package com.chat_backend.service;

import com.chat_backend.dto.UserDto;
import com.chat_backend.dto.UserWithLastMessgeDto;
import com.chat_backend.exception.NotFoundException;
import com.chat_backend.model.Message;
import com.chat_backend.model.User;
import com.chat_backend.repository.MessageRepo;
import com.chat_backend.repository.UserRepo;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserService {

    private UserRepo userRepo;
    private MessageRepo messageRepo;
    private SimpMessagingTemplate messagingTemplate;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public User signUpOrLogin(UserDto userDto) {
        User existingUser = userRepo.findByEmailAndPhoneNumber(userDto.getEmail(), userDto.getPhoneNo());
        if (existingUser != null) {
            logger.info("existing user {}", existingUser.getName());
            existingUser.setOffline(false);
            User updatedUser = userRepo.save(existingUser);
            logger.info("user logged in again: {}", updatedUser.getName());
            messagingTemplate.convertAndSend("/topic/users", updatedUser);
            logger.info("Broadcast an existing user {}", updatedUser.getName());
            return updatedUser;
        } else {
            logger.info("Registering new user {}", userDto.getName());
            User newUser = new User();
            newUser.setName(userDto.getName());
            newUser.setEmail(userDto.getEmail());
            newUser.setPhoneNumber(userDto.getPhoneNo());
            User savedUser = userRepo.save(newUser);
            messagingTemplate.convertAndSend("/topic/users", savedUser);
            logger.info("Broadcast a new user {}", savedUser.getName());
            return savedUser;
        }
    }

    public List<UserWithLastMessgeDto> getAllUsersExceptById(long id) {
        logger.info("fetching all users except: {}", id);
        List<User> users = userRepo.findAllUsersExceptById(id);
        return users.stream().map((user) -> {
            UserWithLastMessgeDto dto = new UserWithLastMessgeDto();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setPhoneNo(user.getPhoneNumber());
            dto.setOffline(user.isOffline());

            Message lastMessage = messageRepo.findTopBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderBySentAtDesc(
                    id, user.getId());
            if (lastMessage != null) {
                logger.info("lastMessage is there" + lastMessage.getMessageText());
                dto.setLastMessageSenderId(lastMessage.getSender().getId());
                dto.setLastMessage(lastMessage.getMessageText());
                dto.setLastMessageSentAt(lastMessage.getSentAt().toString());
            } else {
                logger.info("No lastMessage");
                dto.setLastMessageSenderId(null);
                dto.setLastMessage(null);
                dto.setLastMessageSentAt(null);
            }
            logger.info("set values in dto" + dto.toString());
            return dto;
        }).collect(Collectors.toList());
    }

    public String setUserOffline(Long id) {
        logger.info("Setting user offline {}", id);
        User user = userRepo.findById(id).orElseThrow(() -> new NotFoundException("User not found with " + id));
        user.setOffline(true);
        User offlineUser = userRepo.save(user);
        messagingTemplate.convertAndSend("/topic/users", offlineUser);
        logger.info("Sending user offline: {}", offlineUser.getName());
        logger.info("Broadcast an offline status for user: {}", id);
        return "User " + id + " is now offline";
    }
}
