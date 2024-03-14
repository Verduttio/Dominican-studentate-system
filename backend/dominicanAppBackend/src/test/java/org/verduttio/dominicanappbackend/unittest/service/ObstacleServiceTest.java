package org.verduttio.dominicanappbackend.unittest.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.verduttio.dominicanappbackend.entity.Obstacle;
import org.verduttio.dominicanappbackend.entity.ObstacleStatus;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;
import org.verduttio.dominicanappbackend.service.ObstacleService;
import org.verduttio.dominicanappbackend.validation.ObstacleValidator;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ObstacleServiceTest {

    @Mock
    private ObstacleRepository obstacleRepository;

    @Mock
    private ObstacleValidator obstacleValidator;

    @InjectMocks
    private ObstacleService obstacleService;

    @Test
    void findCurrentApprovedObstaclesByUserIdAndTaskId_shouldReturnApprovedObstacles() {
        // Arrange
        Long userId = 1L;
        Long taskId = 2L;

        User user = new User();
        Task task = new Task();
        LocalDate fromDate = LocalDate.of(2024, 5, 10);
        LocalDate toDate = LocalDate.of(2024, 6, 23);
        LocalDate testDate = LocalDate.of(2024, 5, 18);

        Obstacle obstacle1 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.APPROVED, "Answer", user);
        Obstacle obstacle2 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.AWAITING, "Answer", user);
        Obstacle obstacle3 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.APPROVED, "Answer", user);

        List<Obstacle> obstacles = Arrays.asList(obstacle1, obstacle2, obstacle3);

        when(obstacleRepository.findObstaclesByUserIdAndTaskId(userId, taskId)).thenReturn(obstacles);
        when(obstacleValidator.isDateInRange(testDate, fromDate, toDate)).thenReturn(true);

        // Act
        List<Obstacle> result = obstacleService.findApprovedObstaclesByUserIdAndTaskIdForDate(userId, taskId, testDate);

        // Assert
        assertEquals(2, result.size());
        assertEquals(ObstacleStatus.APPROVED, result.get(0).getStatus());
        assertEquals(ObstacleStatus.APPROVED, result.get(1).getStatus());
    }

    @Test
    void findCurrentApprovedObstaclesByUserIdAndTaskId_shouldReturnEmptyListWhenNoApprovedObstacles() {
        // Arrange
        Long userId = 1L;
        Long taskId = 2L;

        User user = new User();
        Task task = new Task();
        LocalDate fromDate = LocalDate.of(2024, 5, 10);
        LocalDate toDate = LocalDate.of(2024, 6, 23);
        LocalDate testDate = LocalDate.of(2024, 5, 18);

        Obstacle obstacle1 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.AWAITING, "Answer", user);
        Obstacle obstacle2 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.REJECTED, "Answer", user);

        List<Obstacle> obstacles = Arrays.asList(obstacle1, obstacle2);

        when(obstacleRepository.findObstaclesByUserIdAndTaskId(userId, taskId)).thenReturn(obstacles);
        when(obstacleValidator.isDateInRange(testDate, fromDate, toDate)).thenReturn(true);

        // Act
        List<Obstacle> result = obstacleService.findApprovedObstaclesByUserIdAndTaskIdForDate(userId, taskId, testDate);

        // Assert
        assertEquals(0, result.size());
    }

    @Test
    void findCurrentApprovedObstaclesByUserIdAndTaskId_shouldReturnEmptyListWhenNoApprovedObstaclesNow() {
        // Arrange
        Long userId = 1L;
        Long taskId = 2L;

        User user = new User();
        Task task = new Task();
        LocalDate fromDate = LocalDate.of(2024, 5, 10);
        LocalDate toDate = LocalDate.of(2024, 6, 23);
        LocalDate testDate = LocalDate.of(2024, 4, 18);

        Obstacle obstacle1 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.APPROVED, "Answer", user);
        Obstacle obstacle2 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.REJECTED, "Answer", user);

        List<Obstacle> obstacles = Arrays.asList(obstacle1, obstacle2);

        when(obstacleRepository.findObstaclesByUserIdAndTaskId(userId, taskId)).thenReturn(obstacles);
        when(obstacleValidator.isDateInRange(testDate, fromDate, toDate)).thenReturn(false);

        // Act
        List<Obstacle> result = obstacleService.findApprovedObstaclesByUserIdAndTaskIdForDate(userId, taskId, testDate);

        // Assert
        assertEquals(0, result.size());
    }
}

