package org.verduttio.dominicanappbackend.unittest.validation;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.verduttio.dominicanappbackend.domain.Conflict;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.validation.ConflictValidator;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ConflictValidatorTest {
    @InjectMocks
    private ConflictValidator conflictValidator;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ConflictRepository conflictRepository;

    @Mock
    private Conflict conflict;

    @Mock
    private Task task1;

    @Mock
    private Task task2;

    @BeforeEach
    void setUp() {
        when(conflict.getTask1()).thenReturn(task1);
        when(conflict.getTask2()).thenReturn(task2);
        when(task1.getId()).thenReturn(1L);
        when(task2.getId()).thenReturn(2L);
    }

    @Test
    void validateConflictFields_shouldThrowExceptionWhenTask1DoesNotExist() {
        // Arrange
        when(taskRepository.existsById(1L)).thenReturn(false);

        // Act & Assert
        Assertions.assertThrows(EntityNotFoundException.class, () -> conflictValidator.validateConflictFieldsOnAdd(conflict));
    }

    @Test
    void validateConflictFields_shouldThrowExceptionWhenTask2DoesNotExist() {
        // Arrange
        when(taskRepository.existsById(1L)).thenReturn(true);
        when(taskRepository.existsById(2L)).thenReturn(false);

        // Act & Assert
        Assertions.assertThrows(EntityNotFoundException.class, () -> conflictValidator.validateConflictFieldsOnAdd(conflict));
    }

    @Test
    void validateConflictFields_shouldThrowExceptionWhenConflictAlreadyExist() {
        // Arrange
        when(taskRepository.existsById(1L)).thenReturn(true);
        when(taskRepository.existsById(2L)).thenReturn(true);
        when(conflictRepository.existsByTaskIds(1L, 2L)).thenReturn(true);

        // Act & Assert
        Assertions.assertThrows(EntityAlreadyExistsException.class, () -> conflictValidator.validateConflictFieldsOnAdd(conflict));
    }
}
