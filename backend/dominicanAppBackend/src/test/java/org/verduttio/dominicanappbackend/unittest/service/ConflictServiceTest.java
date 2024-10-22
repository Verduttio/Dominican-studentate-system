package org.verduttio.dominicanappbackend.unittest.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.verduttio.dominicanappbackend.dto.conflict.ConflictDTO;
import org.verduttio.dominicanappbackend.domain.Conflict;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;
import org.verduttio.dominicanappbackend.service.ConflictService;
import org.verduttio.dominicanappbackend.validation.ConflictValidator;

import java.time.DayOfWeek;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("integration_tests")
public class ConflictServiceTest {

    @Mock
    private ConflictRepository conflictRepository;

    @Mock
    private ConflictValidator conflictValidator;

    @InjectMocks
    private ConflictService conflictService;

    @Test
    public void testGetAllConflicts() {
        Conflict conflict1 = new Conflict();
        Conflict conflict2 = new Conflict();

        List<Conflict> expectedConflicts = Arrays.asList(conflict1, conflict2);
        when(conflictRepository.findAll()).thenReturn(expectedConflicts);

        List<Conflict> actualConflicts = conflictService.getAllConflicts();

        assertThat(actualConflicts).isEqualTo(expectedConflicts);
    }

    @Test
    public void testGetConflictById() {
        Long conflictId = 1L;
        Conflict expectedConflict = new Conflict();
        expectedConflict.setId(conflictId);

        when(conflictRepository.findById(conflictId)).thenReturn(Optional.of(expectedConflict));

        Optional<Conflict> actualConflict = conflictService.getConflictById(conflictId);

        assertThat(actualConflict).isPresent().contains(expectedConflict);
    }

    @Test
    public void testSaveConflictDTO() {
        ConflictDTO conflictDTO = mock(ConflictDTO.class);
        Conflict conflict = new Conflict();
        when(conflictDTO.onlyIdFieldsAndDaysToConflict()).thenReturn(conflict);

        doNothing().when(conflictValidator).validateConflictFieldsOnAdd(conflict);
        when(conflictRepository.save(conflict)).thenReturn(conflict);

        conflictService.saveConflict(conflictDTO);

        verify(conflictValidator, times(1)).validateConflictFieldsOnAdd(conflict);
        verify(conflictRepository, times(1)).save(conflict);
    }

    @Test
    public void testSaveConflict() {
        Conflict conflict = new Conflict();

        when(conflictRepository.save(conflict)).thenReturn(conflict);

        conflictService.saveConflict(conflict);

        verify(conflictRepository, times(1)).save(conflict);
    }

    @Test
    public void testDeleteConflict() {
        Long conflictId = 1L;

        doNothing().when(conflictValidator).checkIfConflictExists(conflictId);
        doNothing().when(conflictRepository).deleteById(conflictId);

        conflictService.deleteConflict(conflictId);

        verify(conflictValidator, times(1)).checkIfConflictExists(conflictId);
        verify(conflictRepository, times(1)).deleteById(conflictId);
    }

    @Test
    public void testTasksAreInConflict() {
        Long task1Id = 1L;
        Long task2Id = 2L;

        when(conflictRepository.existsByTaskIds(task1Id, task2Id)).thenReturn(true);

        boolean result = conflictService.tasksAreInConflict(task1Id, task2Id);

        assertThat(result).isTrue();
    }

    @Test
    public void testTasksAreInConflictWithDayOfWeek() {
        Long task1Id = 1L;
        Long task2Id = 2L;
        DayOfWeek dayOfWeek = DayOfWeek.MONDAY;
        boolean isFeastDay = false;

        when(conflictRepository.existsByTaskIdsAndDayOfWeek(task1Id, task2Id, dayOfWeek)).thenReturn(true);

        boolean result = conflictService.tasksAreInConflict(task1Id, task2Id, dayOfWeek, isFeastDay);

        assertThat(result).isTrue();
    }

    @Test
    public void testTasksAreInConflictWithDayOfWeekAndFeastDay() {
        Long task1Id = 1L;
        Long task2Id = 2L;
        DayOfWeek dayOfWeek = DayOfWeek.MONDAY;
        boolean isFeastDay = true;

        when(conflictRepository.existsByTaskIdsAndDayOfWeek(task1Id, task2Id, DayOfWeek.SUNDAY)).thenReturn(true);

        boolean result = conflictService.tasksAreInConflict(task1Id, task2Id, dayOfWeek, isFeastDay);

        assertThat(result).isTrue();
    }

    @Test
    public void testTasksAreInConflictWithConflictList() {
        Long task1Id = 1L;
        Long task2Id = 2L;
        DayOfWeek dayOfWeek = DayOfWeek.MONDAY;
        boolean isFeastDay = false;
        Conflict conflict = new Conflict();
        Task task1 = new Task();
        task1.setId(task1Id);
        Task task2 = new Task();
        task2.setId(task2Id);
        conflict.setTask1(task1);
        conflict.setTask2(task2);
        conflict.setDaysOfWeek(Set.of(dayOfWeek));
        List<Conflict> conflicts = Collections.singletonList(conflict);

        boolean result = conflictService.tasksAreInConflict(task1Id, task2Id, conflicts, dayOfWeek, isFeastDay);

        assertThat(result).isTrue();
    }

    @Test
    public void testTasksAreNotInConflictWithConflictListAndFeastDay() {
        Long task1Id = 1L;
        Long task2Id = 2L;
        DayOfWeek dayOfWeek = DayOfWeek.MONDAY;
        boolean isFeastDay = true;
        Conflict conflict = new Conflict();
        Task task1 = new Task();
        task1.setId(task1Id);
        Task task2 = new Task();
        task2.setId(task2Id);
        conflict.setTask1(task1);
        conflict.setTask2(task2);
        conflict.setDaysOfWeek(Set.of(dayOfWeek));
        List<Conflict> conflicts = Collections.singletonList(conflict);

        boolean result = conflictService.tasksAreInConflict(task1Id, task2Id, conflicts, dayOfWeek, isFeastDay);

        assertThat(result).isFalse();
    }

    @Test
    public void testUpdateConflict() {
        Long conflictId = 1L;
        ConflictDTO conflictDTO = mock(ConflictDTO.class);
        Conflict conflict = new Conflict();
        conflict.setId(conflictId);
        when(conflictDTO.onlyIdFieldsAndDaysToConflict()).thenReturn(conflict);

        doNothing().when(conflictValidator).validateConflictFieldsOnUpdate(conflict);
        when(conflictRepository.save(conflict)).thenReturn(conflict);

        conflictService.updateConflict(conflictId, conflictDTO);

        verify(conflictValidator, times(1)).validateConflictFieldsOnUpdate(conflict);
        verify(conflictRepository, times(1)).save(conflict);
    }

    @Test
    public void testExistsById() {
        Long conflictId = 1L;

        when(conflictRepository.existsById(conflictId)).thenReturn(true);

        boolean exists = conflictService.existsById(conflictId);

        assertThat(exists).isTrue();
    }

    @Test
    public void testDeleteAllConflictsByTaskId() {
        Long taskId = 1L;

        doNothing().when(conflictRepository).deleteAllByTaskId(taskId);

        conflictService.deleteAllConflictsByTaskId(taskId);

        verify(conflictRepository, times(1)).deleteAllByTaskId(taskId);
    }

    @Test
    public void testFindAllByTaskId() {
        Long taskId = 1L;
        Conflict conflict1 = new Conflict();
        Conflict conflict2 = new Conflict();

        List<Conflict> expectedConflicts = Arrays.asList(conflict1, conflict2);
        when(conflictRepository.findAllByTaskId(taskId)).thenReturn(expectedConflicts);

        List<Conflict> actualConflicts = conflictService.findAllByTaskId(taskId);

        assertThat(actualConflicts).isEqualTo(expectedConflicts);
    }
}