package org.verduttio.dominicanappbackend.unittest.repository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.verduttio.dominicanappbackend.entity.Obstacle;
import org.verduttio.dominicanappbackend.entity.ObstacleStatus;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@DataJpaTest
@ExtendWith(SpringExtension.class)
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("integration_tests")
public class ObstacleRepositoryTest {

    @Mock
    private ObstacleRepository obstacleRepository;


    @Test
    public void testFindObstaclesByUserIdAndTaskId() {
        Long userId = 1L;
        Long taskId = 2L;
        Obstacle obstacle1 = new Obstacle();
        Obstacle obstacle2 = new Obstacle();

        List<Obstacle> expectedObstacles = Arrays.asList(obstacle1, obstacle2);
        when(obstacleRepository.findObstaclesByUserIdAndTaskId(userId, taskId)).thenReturn(expectedObstacles);

        List<Obstacle> actualObstacles = obstacleRepository.findObstaclesByUserIdAndTaskId(userId, taskId);

        assertThat(actualObstacles).isEqualTo(expectedObstacles);
    }

    @Test
    public void testFindAllSorted() {
        Obstacle obstacle1 = new Obstacle();
        Obstacle obstacle2 = new Obstacle();

        List<Obstacle> expectedObstacles = Arrays.asList(obstacle1, obstacle2);
        when(obstacleRepository.findAllSorted()).thenReturn(expectedObstacles);

        List<Obstacle> actualObstacles = obstacleRepository.findAllSorted();

        assertThat(actualObstacles).isEqualTo(expectedObstacles);
    }

    @Test
    public void testFindAllSortedPageable() {
        Obstacle obstacle1 = new Obstacle();
        Obstacle obstacle2 = new Obstacle();
        Pageable pageable = PageRequest.of(0, 2);
        Page<Obstacle> expectedPage = new PageImpl<>(Arrays.asList(obstacle1, obstacle2), pageable, 2);

        when(obstacleRepository.findAllSorted(pageable)).thenReturn(expectedPage);

        Page<Obstacle> actualPage = obstacleRepository.findAllSorted(pageable);

        assertThat(actualPage).isEqualTo(expectedPage);
    }

    @Test
    public void testFindObstaclesByUserIdSortedCustom() {
        Long userId = 1L;
        Obstacle obstacle1 = new Obstacle();
        Obstacle obstacle2 = new Obstacle();

        List<Obstacle> expectedObstacles = Arrays.asList(obstacle1, obstacle2);
        when(obstacleRepository.findObstaclesByUserIdSortedCustom(userId)).thenReturn(expectedObstacles);

        List<Obstacle> actualObstacles = obstacleRepository.findObstaclesByUserIdSortedCustom(userId);

        assertThat(actualObstacles).isEqualTo(expectedObstacles);
    }

    @Test
    public void testFindObstaclesByUserIdSortedCustomPageable() {
        Long userId = 1L;
        Obstacle obstacle1 = new Obstacle();
        Obstacle obstacle2 = new Obstacle();
        Pageable pageable = PageRequest.of(0, 2);
        Page<Obstacle> expectedPage = new PageImpl<>(Arrays.asList(obstacle1, obstacle2), pageable, 2);

        when(obstacleRepository.findObstaclesByUserIdSortedCustom(userId, pageable)).thenReturn(expectedPage);

        Page<Obstacle> actualPage = obstacleRepository.findObstaclesByUserIdSortedCustom(userId, pageable);

        assertThat(actualPage).isEqualTo(expectedPage);
    }

    @Test
    public void testFindAllByTaskId() {
        Long taskId = 2L;
        Obstacle obstacle1 = new Obstacle();
        Obstacle obstacle2 = new Obstacle();

        List<Obstacle> expectedObstacles = Arrays.asList(obstacle1, obstacle2);
        when(obstacleRepository.findAllByTaskId(taskId)).thenReturn(expectedObstacles);

        List<Obstacle> actualObstacles = obstacleRepository.findAllByTaskId(taskId);

        assertThat(actualObstacles).isEqualTo(expectedObstacles);
    }

    @Test
    public void testDeleteAllByTaskId() {
        Long taskId = 2L;

        doNothing().when(obstacleRepository).deleteAllByTaskId(taskId);

        obstacleRepository.deleteAllByTaskId(taskId);

        verify(obstacleRepository, times(1)).deleteAllByTaskId(taskId);
    }

    @Test
    public void testDeleteAllByApplicantUserId() {
        Long userId = 1L;

        doNothing().when(obstacleRepository).deleteAllByApplicantUserId(userId);

        obstacleRepository.deleteAllByApplicantUserId(userId);

        verify(obstacleRepository, times(1)).deleteAllByApplicantUserId(userId);
    }

    @Test
    public void testUpdateAllByRecipientUserIdToNull() {
        Long userId = 1L;

        doNothing().when(obstacleRepository).updateAllByRecipientUserIdToNull(userId);

        obstacleRepository.updateAllByRecipientUserIdToNull(userId);

        verify(obstacleRepository, times(1)).updateAllByRecipientUserIdToNull(userId);
    }

    @Test
    public void testCountAllByStatus() {
        ObstacleStatus status = ObstacleStatus.AWAITING;
        Long expectedCount = 5L;

        when(obstacleRepository.countAllByStatus(status)).thenReturn(expectedCount);

        Long actualCount = obstacleRepository.countAllByStatus(status);

        assertThat(actualCount).isEqualTo(expectedCount);
    }

    @Test
    public void testFindObstaclesByUserIdAndTaskIdWithEmptyResult() {
        Long userId = 1L;
        Long taskId = 2L;

        when(obstacleRepository.findObstaclesByUserIdAndTaskId(userId, taskId)).thenReturn(Collections.emptyList());

        List<Obstacle> actualObstacles = obstacleRepository.findObstaclesByUserIdAndTaskId(userId, taskId);

        assertThat(actualObstacles).isEmpty();
    }

    @Test
    public void testFindAllSortedWithEmptyResult() {
        when(obstacleRepository.findAllSorted()).thenReturn(Collections.emptyList());

        List<Obstacle> actualObstacles = obstacleRepository.findAllSorted();

        assertThat(actualObstacles).isEmpty();
    }

    @Test
    public void testFindAllByTaskIdWithEmptyResult() {
        Long taskId = 2L;

        when(obstacleRepository.findAllByTaskId(taskId)).thenReturn(Collections.emptyList());

        List<Obstacle> actualObstacles = obstacleRepository.findAllByTaskId(taskId);

        assertThat(actualObstacles).isEmpty();
    }

    @Test
    public void testDeleteAllByTaskIdWithNonExistingTask() {
        Long taskId = 999L;

        doNothing().when(obstacleRepository).deleteAllByTaskId(taskId);

        obstacleRepository.deleteAllByTaskId(taskId);

        verify(obstacleRepository, times(1)).deleteAllByTaskId(taskId);
    }

    @Test
    public void testDeleteAllByApplicantUserIdWithNonExistingUser() {
        Long userId = 999L;

        doNothing().when(obstacleRepository).deleteAllByApplicantUserId(userId);

        obstacleRepository.deleteAllByApplicantUserId(userId);

        verify(obstacleRepository, times(1)).deleteAllByApplicantUserId(userId);
    }
}