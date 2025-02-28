package com.chat_backend.validator;

import com.chat_backend.annotation.NotEqualIds;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.reflect.Field;
import java.util.logging.Logger;

public class NotEqualIdsValidator implements ConstraintValidator<NotEqualIds, Object> {

    private static final Logger logger = Logger.getLogger(NotEqualIdsValidator.class.getName());

    @Override
    public boolean isValid(Object o, ConstraintValidatorContext constraintValidatorContext) {
        if (o == null) {
            return true;
        }
        try {
            Field senderField = o.getClass().getDeclaredField("senderId");
            senderField.setAccessible(true);
            Object senderId = senderField.get(o);
            Field receiverField = o.getClass().getDeclaredField("receiverId");
            receiverField.setAccessible(true);
            Object receiverId = receiverField.get(o);
            logger.info("Check sender & receiver ids " + senderId + " " + receiverId);
            return !senderId.equals(receiverId);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            return false;
        }
    }
}
