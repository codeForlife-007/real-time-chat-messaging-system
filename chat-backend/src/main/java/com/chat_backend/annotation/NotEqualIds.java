package com.chat_backend.annotation;

import com.chat_backend.validator.NotEqualIdsValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = NotEqualIdsValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface NotEqualIds {
    String message() default "Sender ID and Receiver ID must not be the same";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
