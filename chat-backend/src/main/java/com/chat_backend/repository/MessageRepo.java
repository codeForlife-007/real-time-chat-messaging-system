package com.chat_backend.repository;

import com.chat_backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepo extends JpaRepository<Message, Long> {

    Optional<List<Message>> findByReceiverIdAndDeliveredFalse(Long receiverId);

    @Query("SELECT m FROM Message m WHERE " +
            "(m.sender.id = :senderId AND m.receiver.id = :receiverId) " +
            "OR (m.sender.id = :receiverId AND m.receiver.id = :senderId) " +
            "ORDER BY m.sentAt ASC")
    Optional<List<Message>> findConversation(@Param("senderId") Long senderId,
                                   @Param("receiverId") Long receiverId);

    @Query("SELECT m FROM Message m WHERE " +
            "(m.sender.id = :senderId AND m.receiver.id = :receiverId) " +
            "OR (m.sender.id = :receiverId AND m.receiver.id = :senderId) " +
            "ORDER BY m.sentAt DESC LIMIT 1")
    Message findTopBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderBySentAtDesc(@Param("senderId") Long senderId,
                                             @Param("receiverId") Long receiverId);
}
