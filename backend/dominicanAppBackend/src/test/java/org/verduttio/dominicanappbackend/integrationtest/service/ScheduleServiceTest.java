package org.verduttio.dominicanappbackend.integrationtest.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.domain.RoleType;
import org.verduttio.dominicanappbackend.domain.Schedule;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.repository.RoleRepository;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.schedule.ScheduleService;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@AutoConfigureMockMvc
@ActiveProfiles("integration_tests")
public class ScheduleServiceTest {

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private RoleRepository roleRepository;

    @BeforeEach
    public void setUp() {
        initializeTestData();
    }

    private void initializeTestData() {
        scheduleRepository.deleteAllInBatch();
        taskRepository.deleteAllInBatch();

        Role supervisorRole = new Role("SupervisorRoleName", RoleType.SUPERVISOR, false);
        roleRepository.save(supervisorRole);

        Task task1 = new Task("Task 1", "1", 2, true, null, supervisorRole, EnumSet.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY));
        Task task2 = new Task("Task 2", "1",3, false, null, supervisorRole, EnumSet.allOf(DayOfWeek.class));
        Task task3 = new Task("Task 3", "1",1, true, null, supervisorRole, EnumSet.of(DayOfWeek.FRIDAY));
        task1 = taskRepository.save(task1);
        task2 = taskRepository.save(task2);
        task3 = taskRepository.save(task3);

        Schedule schedule1 = new Schedule(task1, null, LocalDate.of(2024, 2, 5));
        Schedule schedule2 = new Schedule(task2, null, LocalDate.of(2024, 2, 6));
        scheduleRepository.save(schedule1);
        scheduleRepository.save(schedule2);
    }

    @Test
    public void shouldReturnAllTasksWhenNoAssignments() {
        LocalDate from = LocalDate.of(2024, 2, 7);
        LocalDate to = LocalDate.of(2024, 2, 13);

        List<Task> availableTasks = scheduleService.getAvailableTasks(from, to);
        assertEquals(3, availableTasks.size(), "Should return all tasks when there are no assignments in the date range.");
    }

    @Test
    public void shouldReturnTasksWhenNotAllAssignedToLimit() {
        LocalDate from = LocalDate.of(2024, 2, 5);
        LocalDate to = LocalDate.of(2024, 2, 11);

        List<Task> availableTasks = scheduleService.getAvailableTasks(from, to);
        assertFalse(availableTasks.isEmpty(), "Should return tasks that are not fully assigned.");
    }

    @Test
    public void shouldNotReturnTasksWithParticipantForWholePeriodFalseWhenFullyAssigned() {
        Task task3 = taskRepository.findByName("Task 3").get();
        scheduleRepository.save(new Schedule(task3, null, LocalDate.of(2024, 2, 9)));

        LocalDate from = LocalDate.of(2024, 2, 5);
        LocalDate to = LocalDate.of(2024, 2, 11);

        List<Task> availableTasks = scheduleService.getAvailableTasks(from, to);
        assertFalse(availableTasks.contains(task3), "Task 3 should not be available as it's fully assigned for its day.");
    }

    @Test
    public void shouldReturnAllTasksForSupervisorWhenNoSchedules() {
        LocalDate from = LocalDate.of(2024, 2, 7);
        LocalDate to = LocalDate.of(2024, 2, 13);

        List<Task> availableTasks = scheduleService.getAvailableTasksBySupervisorRole("SupervisorRoleName", from, to);
        assertEquals(3, availableTasks.size(), "Should return all tasks for the supervisor when there are no schedules in the date range.");
    }

    @Test
    public void shouldReturnTasksForSupervisorNotFullyAssigned() {
        LocalDate from = LocalDate.of(2024, 2, 5);
        LocalDate to = LocalDate.of(2024, 2, 11);

        List<Task> availableTasks = scheduleService.getAvailableTasksBySupervisorRole("SupervisorRoleName", from, to);
        assertFalse(availableTasks.isEmpty(), "Should return tasks for the supervisor that are not fully assigned.");
    }

    @Test
    public void shouldNotReturnFullyAssignedTasksForSupervisor() {
        Task task3 = taskRepository.findByName("Task 3").get();
        scheduleRepository.save(new Schedule(task3, null, LocalDate.of(2024, 2, 9)));

        String supervisor = "SupervisorRoleName";
        LocalDate from = LocalDate.of(2024, 2, 1);
        LocalDate to = LocalDate.of(2024, 2, 28);

        List<Task> availableTasks = scheduleService.getAvailableTasksBySupervisorRole(supervisor, from, to);

        availableTasks.forEach(task -> {
            assertNotEquals("Task 3", task.getName(), "Fully assigned tasks should not be returned");
        });


        assertTrue(availableTasks.stream().anyMatch(task -> task.getName().equals("Task 1")), "Tasks not fully assigned should be returned.");
    }

    @Test
    public void shouldThrowExceptionForNonExistentSupervisor() {
        assertThrows(EntityNotFoundException.class, () -> {
            scheduleService.getAvailableTasksBySupervisorRole("NonExistentSupervisor", LocalDate.of(2024, 2, 1), LocalDate.of(2024, 2, 28));
        });
    }



}
