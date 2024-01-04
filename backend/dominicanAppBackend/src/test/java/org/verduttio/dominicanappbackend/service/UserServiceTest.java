package org.verduttio.dominicanappbackend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.verduttio.dominicanappbackend.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void testExistsAnotherUserWithGivenEmail_WhenAnotherUserExists() {
        // Given
        String newEmail = "new.email@example.com";
        String currentEmail = "current.email@example.com";

        when(userRepository.existsByEmail(newEmail)).thenReturn(true);

        // When
        boolean result = userService.existsAnotherUserWithGivenEmail(newEmail, currentEmail);

        // Then
        assertTrue(result);
    }

    @Test
    void testExistsAnotherUserWithGivenEmail_WhenAnotherUserDoesNotExist() {
        // Given
        String newEmail = "new.email@example.com";
        String currentEmail = "current.email@example.com";

        when(userRepository.existsByEmail(newEmail)).thenReturn(false);

        // When
        boolean result = userService.existsAnotherUserWithGivenEmail(newEmail, currentEmail);

        // Then
        assertFalse(result);
    }

    @Test
    void testExistsAnotherUserWithGivenEmail_WhenEmailsAreEqual() {
        // Given
        String email = "same.email@example.com";

        // When
        boolean result = userService.existsAnotherUserWithGivenEmail(email, email);

        // Then
        assertFalse(result);
    }
}

