package com.chat_backend.controller;

import com.chat_backend.exception.NotFoundException;
import com.chat_backend.model.Message;
import com.chat_backend.model.User;
import com.chat_backend.repository.MessageRepo;
import com.chat_backend.repository.UserRepo;
import com.chat_backend.service.UserService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@AllArgsConstructor
public class ChatController {

    private MessageRepo messageRepo;
    private SimpMessagingTemplate messagingTemplate;
    private UserService userService;
    private UserRepo userRepo;
//    private final Map<Long, Set<String>> userSessions = new ConcurrentHashMap<>();
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @MessageMapping("/send")
    public void sendMessage(Message message) {
       Long receiverId = message.getReceiver().getId();
       message.setDelivered(Boolean.FALSE);
       Message savedMessage = messageRepo.save(message);
       User user = userRepo.findById(receiverId).orElseThrow(() -> new NotFoundException("Receiver not found"));
       messagingTemplate.convertAndSend("/topic/messages", savedMessage);
       if (isUserOnline(receiverId)) {
           savedMessage.setDelivered(true);
           messageRepo.save(savedMessage);
       }
    }

//    @SendToUser
//    public void addUser() {
//
//    }

//    @EventListener
//    public void onUserConnected(SessionConnectEvent event) {
//        logger.info("onUserConnected");
//        logger.info("SessionConnectEvent received: {}", event);
//        String userId = event.getUser() != null ? event.getUser().getName() : "null";
//        logger.info("onConnected User ID from principal: {}", userId);
//        String sessionId = event.getMessage().getHeaders().get("simpSessionId").toString();
//        logger.info("Connected session ID: {}", sessionId);
//        if (userId != null) {
//            try {
//                Long id = Long.parseLong(userId);
//                userSessions.computeIfAbsent(id, k -> new HashSet<>()).add(sessionId);
//                logger.info("Added session {} for user {}, total sessions: {}", sessionId, id, userSessions.get(id).size());
//                sendOfflineMessages(id);
//                broadcastUserStatus(id, false);
//            } catch (NumberFormatException e) {
//                System.err.println("Invalid user ID from WebSocket connection: " + userId);
//            }
//        } else {
//            logger.info("No user principal found in WebSocket connection event");
//        }
//    }
//
//    @EventListener
//    public void onUserDisconnected(SessionDisconnectEvent event) {
//        logger.info("onUserDisconnected");
//        logger.info("SessionDisconnectEvent received: {}", event);
//        String userId = event.getUser() != null ? event.getUser().getName() : null;
//        logger.info("onDisconnected User ID from principal: {}", userId);
//        String sessionId = event.getSessionId();
//        logger.info("Disconnected session ID: {}", sessionId);
//        if (userId != null) {
//            try {
//                Long id = Long.parseLong(userId);
//                if (userSessions.containsKey(id)) {
//                    Set<String> sessions = userSessions.get(id);
//                    boolean removed = sessions.remove(sessionId);
//                    logger.info("User disconnected: {}, Session: {}, Remaining sessions: {}", id, sessionId, sessions.size());
//                    if (sessions.isEmpty()) {
//                        userSessions.remove(id);
//                        logger.info("All sessions gone for user {}, marking offline", id);
//                        broadcastUserStatus(id, true);
//                    }
//                } else {
//                    logger.info("No sessions found for user: {} on disconnect", id);
//                }
//            } catch (NumberFormatException e) {
//                System.err.println("Invalid user ID from websocket disconnect: " + userId);
//            }
//        } else {
//            logger.info("No user principal in disconnect event");
//        }
//    }

    @PostMapping("/connect")
    @ResponseBody
    public String connectUser(@RequestParam Long userId) {
        sendOfflineMessages(userId);
        return "User " + userId + " connected!";
    }

    private void sendOfflineMessages(Long userId) {
        List<Message> offlineMessages = messageRepo.findByReceiverIdAndDeliveredFalse(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id " + userId));
        for (Message message : offlineMessages) {
            messagingTemplate.convertAndSend("/topic/messages", message);
            message.setDelivered(true);
            messageRepo.save(message);
        }
    }

    public boolean isUserOnline(Long receiverId) {
        User user = userRepo.findById(receiverId).orElse(null);
        return user != null && !user.isOffline();
//        return userSessions.containsKey(receiverId) && !userSessions.get(receiverId).isEmpty();
    }

//    private void broadcastUserStatus(Long userId, boolean offline) {
//        Map<String, Object> status = new HashMap<>();
//        status.put("id", userId);
//        status.put("offline", offline);
//        messagingTemplate.convertAndSend("/topic/users", status);
//    }
}
