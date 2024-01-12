package org.verduttio.dominicanappbackend.validation;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.verduttio.dominicanappbackend.repository.UserRepository;
import org.verduttio.dominicanappbackend.service.exception.UserAlreadyExistsException;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserValidatorTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserValidator userValidator;

    @Test
    void testExistsAnotherUserWithGivenEmail_WhenAnotherUserExists() {
        // Given
        String newEmail = "new.email@example.com";
        String currentEmail = "current.email@example.com";

        // When
        when(userRepository.existsByEmail(newEmail)).thenReturn(true);

        // Then
        Assertions.assertThrows(UserAlreadyExistsException.class, () ->userValidator.validateEmailWhenUpdate(newEmail, currentEmail));
    }

    @Test
    void testExistsAnotherUserWithGivenEmail_WhenAnotherUserDoesNotExist() {
        // Given
        String newEmail = "new.email@example.com";
        String currentEmail = "current.email@example.com";

        // When
        when(userRepository.existsByEmail(newEmail)).thenReturn(false);

        // Then
        Assertions.assertDoesNotThrow(() -> userValidator.validateEmailWhenUpdate(newEmail, currentEmail));
    }

    @Test
    void testExistsAnotherUserWithGivenEmail_WhenEmailsAreEqual() {
        // Given
        String email = "same.email@example.com";

        Assertions.assertDoesNotThrow(() -> userValidator.validateEmailWhenUpdate(email, email));
    }
}

