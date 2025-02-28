package com.chat_backend.controller;

import com.chat_backend.dto.UserDto;
import com.chat_backend.dto.UserWithLastMessgeDto;
import com.chat_backend.model.User;
import com.chat_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("user")
@AllArgsConstructor
public class UserController {

    private UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @PostMapping("create")
    public ResponseEntity<User> signUpOrLogin(@Valid @RequestBody UserDto userDto) {
        User user = userService.signUpOrLogin(userDto);
        URI location = URI.create("create" + user.getId());
        return ResponseEntity.created(location).body(user);
    }

    @GetMapping("get-all/except/{id}")
    public ResponseEntity<List<UserWithLastMessgeDto>> getAllUsersExceptById(@PathVariable long id) {
        return ResponseEntity.ok(userService.getAllUsersExceptById(id));
    }

    @PatchMapping("{id}/offline")
    public ResponseEntity<String> setUserOffline(@PathVariable long id) {
        logger.info("Sending user offline via PATCH");
        return ResponseEntity.ok(userService.setUserOffline(id));
    }

    @PostMapping("{id}/offline/post")
    public ResponseEntity<String> setUserOfflineUsingPost(@PathVariable long id) {
        logger.info("Sending user offline via POST");
        return ResponseEntity.ok(userService.setUserOffline(id));
    }

}
