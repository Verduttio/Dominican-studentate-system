package org.verduttio.dominicanappbackend.unittest.repository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.verduttio.dominicanappbackend.entity.Schedule;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@DataJpaTest
@ExtendWith(SpringExtension.class)
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("integration_tests")
public class ScheduleRepositoryTest {

    @Mock
    private ScheduleRepository scheduleRepository;

    @Test
    public void testFindByUserId() {
        Long userId = 1L;
        Schedule schedule1 = new Schedule();
        Schedule schedule2 = new Schedule();

        List<Schedule> expectedSchedules = Arrays.asList(schedule1, schedule2);
        when(scheduleRepository.findByUserId(userId)).thenReturn(expectedSchedules);

        List<Schedule> actualSchedules = scheduleRepository.findByUserId(userId);

        assertThat(actualSchedules).isEqualTo(expectedSchedules);
    }

    @Test
    public void testFindByDateBetween() {
        LocalDate from = LocalDate.of(2023, 1, 1);
        LocalDate to = LocalDate.of(2023, 12, 31);
        Schedule schedule1 = new Schedule();
        Schedule schedule2 = new Schedule();

        List<Schedule> expectedSchedules = Arrays.asList(schedule1, schedule2);
        when(scheduleRepository.findByDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(from, to)).thenReturn(expectedSchedules);

        List<Schedule> actualSchedules = scheduleRepository.findByDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(from, to);

        assertThat(actualSchedules).isEqualTo(expectedSchedules);
    }

    @Test
    public void testFindByTaskIdAndDateBetween() {
        Long taskId = 1L;
        LocalDate from = LocalDate.of(2023, 1, 1);
        LocalDate to = LocalDate.of(2023, 12, 31);
        Schedule schedule1 = new Schedule();
        Schedule schedule2 = new Schedule();

        List<Schedule> expectedSchedules = Arrays.asList(schedule1, schedule2);
        when(scheduleRepository.findByTaskIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(taskId, from, to)).thenReturn(expectedSchedules);

        List<Schedule> actualSchedules = scheduleRepository.findByTaskIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(taskId, from, to);

        assertThat(actualSchedules).isEqualTo(expectedSchedules);
    }

    @Test
    public void testFindByUserIdAndDateBetween() {
        Long userId = 1L;
        LocalDate from = LocalDate.of(2023, 1, 1);
        LocalDate to = LocalDate.of(2023, 12, 31);
        Schedule schedule1 = new Schedule();
        Schedule schedule2 = new Schedule();

        List<Schedule> expectedSchedules = Arrays.asList(schedule1, schedule2);
        when(scheduleRepository.findByUserIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(userId, from, to)).thenReturn(expectedSchedules);

        List<Schedule> actualSchedules = scheduleRepository.findByUserIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(userId, from, to);

        assertThat(actualSchedules).isEqualTo(expectedSchedules);
    }

    @Test
    public void testFindByUserIdAndDate() {
        Long userId = 1L;
        LocalDate date = LocalDate.of(2023, 6, 15);
        Schedule schedule1 = new Schedule();
        Schedule schedule2 = new Schedule();

        List<Schedule> expectedSchedules = Arrays.asList(schedule1, schedule2);
        when(scheduleRepository.findByUserIdAndDateOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(userId, date)).thenReturn(expectedSchedules);

        List<Schedule> actualSchedules = scheduleRepository.findByUserIdAndDateOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(userId, date);

        assertThat(actualSchedules).isEqualTo(expectedSchedules);
    }

    @Test
    public void testFindSchedulesLaterOrInDay() {
        LocalDate targetDate = LocalDate.of(2023, 6, 15);
        Schedule schedule1 = new Schedule();
        Schedule schedule2 = new Schedule();

        List<Schedule> expectedSchedules = Arrays.asList(schedule1, schedule2);
        when(scheduleRepository.findSchedulesLaterOrInDay(targetDate)).thenReturn(expectedSchedules);

        List<Schedule> actualSchedules = scheduleRepository.findSchedulesLaterOrInDay(targetDate);

        assertThat(actualSchedules).isEqualTo(expectedSchedules);
    }

    @Test
    public void testDeleteAllByTaskId() {
        Long taskId = 1L;

        doNothing().when(scheduleRepository).deleteAllByTaskId(taskId);

        scheduleRepository.deleteAllByTaskId(taskId);

        verify(scheduleRepository, times(1)).deleteAllByTaskId(taskId);
    }

    @Test
    public void testCountByUserIdAndTaskIdInLastNDays() {
        Long userId = 1L;
        Long taskId = 1L;
        LocalDate startDate = LocalDate.of(2023, 1, 1);
        LocalDate endDate = LocalDate.of(2023, 12, 31);
        long expectedCount = 5L;

        when(scheduleRepository.countByUserIdAndTaskIdInLastNDays(userId, taskId, startDate, endDate)).thenReturn(expectedCount);

        long actualCount = scheduleRepository.countByUserIdAndTaskIdInLastNDays(userId, taskId, startDate, endDate);

        assertThat(actualCount).isEqualTo(expectedCount);
    }

    @Test
    public void testFindLatestTaskCompletionDateByUserIdAndTaskId() {
        Long userId = 1L;
        Long taskId = 1L;
        LocalDate upToDate = LocalDate.of(2023, 6, 15);
        LocalDate expectedDate = LocalDate.of(2023, 6, 14);

        when(scheduleRepository.findLatestTaskCompletionDateByUserIdAndTaskId(userId, taskId, upToDate)).thenReturn(Optional.of(expectedDate));

        Optional<LocalDate> actualDate = scheduleRepository.findLatestTaskCompletionDateByUserIdAndTaskId(userId, taskId, upToDate);

        assertThat(actualDate).isPresent().contains(expectedDate);
    }

    @Test
    public void testDeleteAllByUserId() {
        Long userId = 1L;

        doNothing().when(scheduleRepository).deleteAllByUserId(userId);

        scheduleRepository.deleteAllByUserId(userId);

        verify(scheduleRepository, times(1)).deleteAllByUserId(userId);
    }

    @Test
    public void testDeleteAllByUserIdAndTaskIdAndDateBetween() {
        Long userId = 1L;
        Long taskId = 1L;
        LocalDate fromDate = LocalDate.of(2023, 1, 1);
        LocalDate toDate = LocalDate.of(2023, 12, 31);

        doNothing().when(scheduleRepository).deleteAllByUserIdAndTaskIdAndDateBetween(userId, taskId, fromDate, toDate);

        scheduleRepository.deleteAllByUserIdAndTaskIdAndDateBetween(userId, taskId, fromDate, toDate);

        verify(scheduleRepository, times(1)).deleteAllByUserIdAndTaskIdAndDateBetween(userId, taskId, fromDate, toDate);
    }

    @Test
    public void testFindByUserIdWithEmptyResult() {
        Long userId = 1L;

        when(scheduleRepository.findByUserId(userId)).thenReturn(Collections.emptyList());

        List<Schedule> actualSchedules = scheduleRepository.findByUserId(userId);

        assertThat(actualSchedules).isEmpty();
    }

    @Test
    public void testFindByDateBetweenWithEmptyResult() {
        LocalDate from = LocalDate.of(2023, 1, 1);
        LocalDate to = LocalDate.of(2023, 12, 31);

        when(scheduleRepository.findByDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(from, to)).thenReturn(Collections.emptyList());

        List<Schedule> actualSchedules = scheduleRepository.findByDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(from, to);

        assertThat(actualSchedules).isEmpty();
    }

    @Test
    public void testFindByTaskIdAndDateBetweenWithEmptyResult() {
        Long taskId = 1L;
        LocalDate from = LocalDate.of(2023, 1, 1);
        LocalDate to = LocalDate.of(2023, 12, 31);

        when(scheduleRepository.findByTaskIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(taskId, from, to)).thenReturn(Collections.emptyList());

        List<Schedule> actualSchedules = scheduleRepository.findByTaskIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(taskId, from, to);

        assertThat(actualSchedules).isEmpty();
    }

    @Test
    public void testFindByUserIdAndDateBetweenWithEmptyResult() {
        Long userId = 1L;
        LocalDate from = LocalDate.of(2023, 1, 1);
        LocalDate to = LocalDate.of(2023, 12, 31);

        when(scheduleRepository.findByUserIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(userId, from, to)).thenReturn(Collections.emptyList());

        List<Schedule> actualSchedules = scheduleRepository.findByUserIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(userId, from, to);

        assertThat(actualSchedules).isEmpty();
    }
}
