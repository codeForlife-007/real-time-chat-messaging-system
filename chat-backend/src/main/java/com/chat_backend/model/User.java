package com.chat_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name="user_tbl")
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name="user_name", nullable = false, unique = true)
    private String name;

    @Column(name="user_email", nullable = false, unique = true)
    private String email;

    @Column(name="user_phone_no", nullable = false, unique = true)
    private String phoneNumber;

    @Column(name="is_offline", nullable = false)
    private boolean isOffline;

    @CreationTimestamp
    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt;
}