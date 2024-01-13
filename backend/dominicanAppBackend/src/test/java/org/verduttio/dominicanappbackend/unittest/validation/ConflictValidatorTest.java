package org.verduttio.dominicanappbackend.unittest.validation;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;
import org.verduttio.dominicanappbackend.service.TaskService;
import org.verduttio.dominicanappbackend.service.exception.ConflictAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.TaskNotFoundException;
import org.verduttio.dominicanappbackend.validation.ConflictValidator;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ConflictValidatorTest {
    @InjectMocks
    private ConflictValidator conflictValidator;

    @Mock
    private TaskService taskService;

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
        when(taskService.taskExistsById(1L)).thenReturn(false);

        // Act & Assert
        Assertions.assertThrows(TaskNotFoundException.class, () -> conflictValidator.validateConflictFields(conflict));
    }

    @Test
    void validateConflictFields_shouldThrowExceptionWhenTask2DoesNotExist() {
        // Arrange
        when(taskService.taskExistsById(1L)).thenReturn(true);
        when(taskService.taskExistsById(2L)).thenReturn(false);

        // Act & Assert
        Assertions.assertThrows(TaskNotFoundException.class, () -> conflictValidator.validateConflictFields(conflict));
    }

    @Test
    void validateConflictFields_shouldThrowExceptionWhenConflictAlreadyExist() {
        // Arrange
        when(taskService.taskExistsById(1L)).thenReturn(true);
        when(taskService.taskExistsById(2L)).thenReturn(true);
        when(conflictRepository.existsByTaskIds(1L, 2L)).thenReturn(true);

        // Act & Assert
        Assertions.assertThrows(ConflictAlreadyExistsException.class, () -> conflictValidator.validateConflictFields(conflict));
    }
}
