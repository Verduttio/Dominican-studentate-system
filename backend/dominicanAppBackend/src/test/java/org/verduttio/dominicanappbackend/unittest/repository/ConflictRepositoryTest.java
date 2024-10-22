package org.verduttio.dominicanappbackend.unittest.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.verduttio.dominicanappbackend.domain.Conflict;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;

import java.time.DayOfWeek;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@ActiveProfiles("integration_tests")
public class ConflictRepositoryTest {

    @Autowired
    private ConflictRepository conflictRepository;

    @Autowired
    private TaskRepository taskRepository;

    private void clearDB() {
        conflictRepository.deleteAll();
        taskRepository.deleteAll();
    }

    @Test
    public void testExistsByTaskIdsAndDayOfWeek() {
        // Given
        Task task1 = new Task();
        taskRepository.save(task1);

        Task task2 = new Task();
        taskRepository.save(task2);

        Conflict conflict = new Conflict();
        conflict.setTask1(task1);
        conflict.setTask2(task2);
        conflict.setDaysOfWeek(Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.SUNDAY));

        conflictRepository.save(conflict);

        // When
        boolean exists = conflictRepository.existsByTaskIdsAndDayOfWeek(task1.getId(), task2.getId(), DayOfWeek.MONDAY);

        // Then
        assertTrue(exists);

        clearDB();
    }

    @Test
    public void testDoesNotExistByTaskIdsAndDayOfWeek() {
        // Given
        Task task1 = new Task();
        taskRepository.save(task1);

        Task task2 = new Task();
        taskRepository.save(task2);

        Conflict conflict = new Conflict();
        conflict.setTask1(task1);
        conflict.setTask2(task2);
        conflict.setDaysOfWeek(Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.SUNDAY));

        conflictRepository.save(conflict);

        // When
        boolean exists = conflictRepository.existsByTaskIdsAndDayOfWeek(task1.getId(), task2.getId(), DayOfWeek.THURSDAY);

        // Then
        assertFalse(exists);

        clearDB();
    }
}