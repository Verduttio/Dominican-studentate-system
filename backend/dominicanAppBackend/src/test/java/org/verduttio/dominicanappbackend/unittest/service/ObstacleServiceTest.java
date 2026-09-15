package org.verduttio.dominicanappbackend.unittest.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.verduttio.dominicanappbackend.domain.obstacle.Obstacle;
import org.verduttio.dominicanappbackend.domain.ObstacleStatus;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.ObstacleService;
import org.verduttio.dominicanappbackend.validation.ObstacleValidator;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ObstacleServiceTest {

    @Mock
    private ObstacleRepository obstacleRepository;

    @Mock
    private ObstacleValidator obstacleValidator;

    // --- NOWY MOCK ---
    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private ObstacleService obstacleService;

    // Metoda pomocnicza tworząca prawidłowe zadanie na potrzeby testów
    private Task createValidMockTask(Long id) {
        Task task = new Task();
        task.setId(id);
        Role role = new Role();
        role.setName("Zmywak"); // Dowolna normalna kategoria
        task.setSupervisorRole(role);
        return task;
    }

    @Test
    void findCurrentApprovedObstaclesByUserIdAndTaskId_shouldReturnApprovedObstacles() {
        // Arrange
        Long userId = 1L;
        Long taskId = 2L;

        User user = new User();
        Task task = createValidMockTask(taskId); // Używamy metody pomocniczej

        LocalDate fromDate = LocalDate.of(2024, 5, 10);
        LocalDate toDate = LocalDate.of(2024, 6, 23);
        LocalDate testDate = LocalDate.of(2024, 5, 18);

        Obstacle obstacle1 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.APPROVED, "Answer", user);
        Obstacle obstacle2 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.AWAITING, "Answer", user);
        Obstacle obstacle3 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.APPROVED, "Answer", user);

        List<Obstacle> obstacles = Arrays.asList(obstacle1, obstacle2, obstacle3);

        when(taskRepository.findById(anyLong())).thenReturn(Optional.of(task)); // Mock repozytorium
        when(obstacleRepository.findObstaclesByUserIdSortedCustom(userId)).thenReturn(obstacles); // Zmienione na aktualnie wywoływaną metodę
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
        Task task = createValidMockTask(taskId);

        LocalDate fromDate = LocalDate.of(2024, 5, 10);
        LocalDate toDate = LocalDate.of(2024, 6, 23);
        LocalDate testDate = LocalDate.of(2024, 5, 18);

        Obstacle obstacle1 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.AWAITING, "Answer", user);
        Obstacle obstacle2 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.REJECTED, "Answer", user);

        List<Obstacle> obstacles = Arrays.asList(obstacle1, obstacle2);

        when(taskRepository.findById(anyLong())).thenReturn(Optional.of(task));
        when(obstacleRepository.findObstaclesByUserIdSortedCustom(userId)).thenReturn(obstacles);

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
        Task task = createValidMockTask(taskId);

        LocalDate fromDate = LocalDate.of(2024, 5, 10);
        LocalDate toDate = LocalDate.of(2024, 6, 23);
        LocalDate testDate = LocalDate.of(2024, 4, 18);

        Obstacle obstacle1 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.APPROVED, "Answer", user);
        Obstacle obstacle2 = new Obstacle(user, Set.of(task), fromDate, toDate, "Description", ObstacleStatus.REJECTED, "Answer", user);

        List<Obstacle> obstacles = Arrays.asList(obstacle1, obstacle2);

        when(taskRepository.findById(anyLong())).thenReturn(Optional.of(task));
        when(obstacleRepository.findObstaclesByUserIdSortedCustom(userId)).thenReturn(obstacles);
        when(obstacleValidator.isDateInRange(testDate, fromDate, toDate)).thenReturn(false);

        // Act
        List<Obstacle> result = obstacleService.findApprovedObstaclesByUserIdAndTaskIdForDate(userId, taskId, testDate);

        // Assert
        assertEquals(0, result.size());
    }
}