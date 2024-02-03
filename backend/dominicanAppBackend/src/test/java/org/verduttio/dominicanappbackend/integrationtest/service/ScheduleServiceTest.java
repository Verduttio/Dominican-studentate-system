package org.verduttio.dominicanappbackend.integrationtest.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.verduttio.dominicanappbackend.entity.Schedule;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.ScheduleService;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
@AutoConfigureMockMvc
@ActiveProfiles("integration_tests")
public class ScheduleServiceTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @BeforeEach
    public void setUp() {
        initializeTestData();
    }

    private void initializeTestData() {
        scheduleRepository.deleteAllInBatch();
        taskRepository.deleteAllInBatch();

        Task task1 = new Task("Task 1", 2, true, false, null, null, EnumSet.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY));
        Task task2 = new Task("Task 2", 3, false, true, null, null, EnumSet.allOf(DayOfWeek.class));
        Task task3 = new Task("Task 3", 1, true, false, null, null, EnumSet.of(DayOfWeek.FRIDAY));
        task1 = taskRepository.save(task1);
        task2 = taskRepository.save(task2);
        task3 = taskRepository.save(task3);

        scheduleRepository.save(new Schedule(task1, null, LocalDate.of(2024, 2, 5)));
        scheduleRepository.save(new Schedule(task2, null, LocalDate.of(2024, 2, 6)));
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
    public void shouldValidateDateRange() throws Exception {
        String from = "01-01-2024";
        String to = "07-01-2024";

        mockMvc.perform(get("/api/schedules/available-tasks")
                        .param("from", from)
                        .param("to", to))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        String invalidFrom = "01-01-2024";
        String invalidTo = "08-01-2024";

        mockMvc.perform(get("/api/schedules/available-tasks")
                        .param("from", invalidFrom)
                        .param("to", invalidTo))
                .andExpect(status().isBadRequest());
    }
}
