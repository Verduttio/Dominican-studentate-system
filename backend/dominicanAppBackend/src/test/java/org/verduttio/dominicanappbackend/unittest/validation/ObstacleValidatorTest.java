package org.verduttio.dominicanappbackend.unittest.validation;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.verduttio.dominicanappbackend.dto.obstacle.ObstacleRequestDTO;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.UserService;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.validation.ObstacleValidator;

@ExtendWith(MockitoExtension.class)
class ObstacleValidatorTest {

    @InjectMocks
    private ObstacleValidator obstacleValidator;

    @Mock
    private UserService userService;

    @Mock
    private TaskRepository taskRepository;

    @Test
    void validateObstacleRequestDTO_WithValidData_ShouldPass() {
        ObstacleRequestDTO dto = new ObstacleRequestDTO();
        dto.setUserId(1L);
        dto.setTaskId(1L);

        Mockito.when(userService.existsById(dto.getUserId())).thenReturn(true);
        Mockito.when(taskRepository.existsById(dto.getTaskId())).thenReturn(true);

        Assertions.assertDoesNotThrow(() -> obstacleValidator.validateObstacleRequestDTO(dto));
    }

    @Test
    void validateObstacleRequestDTO_WithInvalidUserId_ShouldThrowException() {
        ObstacleRequestDTO dto = new ObstacleRequestDTO();
        dto.setUserId(1L);
        dto.setTaskId(1L);

        Mockito.when(userService.existsById(dto.getUserId())).thenReturn(false);

        Assertions.assertThrows(EntityNotFoundException.class,
                () -> obstacleValidator.validateObstacleRequestDTO(dto));
    }
}
