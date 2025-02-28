package com.chat_backend.repository;

import com.chat_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    User findByEmailAndPhoneNumber(String email, String phoneNo);

    @Query("SELECT u FROM User u WHERE u.id <> :userId")
    List<User> findAllUsersExceptById(@Param("userId") Long userId);
}