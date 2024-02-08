package org.verduttio.dominicanappbackend.integrationtest.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.transaction.annotation.Transactional;
import org.verduttio.dominicanappbackend.dto.schedule.AddScheduleForDailyPeriodTaskDTO;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.Schedule;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.repository.UserRepository;
import org.verduttio.dominicanappbackend.service.RoleService;
import org.verduttio.dominicanappbackend.service.ScheduleService;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.RoleNotMeetRequirementsException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@Transactional
@ActiveProfiles("integration_tests")
public class AddScheduleValidationTests {

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RoleService roleService;

    private User testUser;
    private Task testTask;

    @BeforeEach
    public void setUp() {
        Role taskExecutorRole = new Role();
        taskExecutorRole.setName("ROLE_TASK_EXECUTOR");
        roleService.saveRole(taskExecutorRole);


        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setName("Test");
        testUser.setSurname("User");
        testUser.setRoles(Set.of(taskExecutorRole));
        userRepository.save(testUser);


        testTask = new Task();
        testTask.setName("Test Task");
        testTask.setDaysOfWeek(Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY));
        testTask.setAllowedRoles(Set.of(taskExecutorRole));
        taskRepository.save(testTask);
    }


    @Test
    public void shouldThrowWhenInvalidDateRange() {
        LocalDate startDate = LocalDate.of(2024, 1, 2); // Not monday
        LocalDate endDate = LocalDate.of(2024, 1, 8); // Not sunday
        LocalDate taskDate = LocalDate.of(2024, 1, 3);

        AddScheduleForDailyPeriodTaskDTO dto = new AddScheduleForDailyPeriodTaskDTO();
        dto.setUserId(testUser.getId());
        dto.setTaskId(testTask.getId());
        dto.setWeekStartDate(startDate);
        dto.setWeekEndDate(endDate);
        dto.setTaskDate(taskDate);

        assertThrows(IllegalArgumentException.class, () ->
                        scheduleService.validateAddScheduleForDailyPeriodTask(dto, false, startDate, endDate, taskDate),
                "Invalid date range. The period must start on Monday and end on Sunday, covering exactly one week."
        );
    }

    @Test
    public void shouldThrowWhenTaskDateNotInRange() {
        LocalDate startDate = LocalDate.of(2024, 1, 1); // Monday
        LocalDate endDate = LocalDate.of(2024, 1, 7); // Sunday
        LocalDate taskDate = LocalDate.of(2024, 1, 8); // Out of range

        AddScheduleForDailyPeriodTaskDTO dto = new AddScheduleForDailyPeriodTaskDTO();
        dto.setUserId(testUser.getId());
        dto.setTaskId(testTask.getId());
        dto.setWeekStartDate(startDate);
        dto.setWeekEndDate(endDate);
        dto.setTaskDate(taskDate);

        assertThrows(IllegalArgumentException.class, () ->
                        scheduleService.validateAddScheduleForDailyPeriodTask(dto, false, startDate, endDate, taskDate),
                "Task date is not in the date range."
        );
    }

    @Test
    public void shouldThrowEntityNotFoundExceptionForNonexistentUser() {
        LocalDate startDate = LocalDate.of(2024, 1, 1); // Monday
        LocalDate endDate = LocalDate.of(2024, 1, 7); // Sunday
        LocalDate taskDate = LocalDate.of(2024, 1, 3);

        AddScheduleForDailyPeriodTaskDTO dto = new AddScheduleForDailyPeriodTaskDTO();
        dto.setUserId(9999L);
        dto.setTaskId(testTask.getId());
        dto.setWeekStartDate(startDate);
        dto.setWeekEndDate(endDate);
        dto.setTaskDate(taskDate);

        assertThrows(EntityNotFoundException.class, () ->
                scheduleService.validateAddScheduleForDailyPeriodTask(dto, false, startDate, endDate, taskDate));
    }

    @Test
    public void shouldThrowEntityNotFoundExceptionForNonexistentTask() {
        LocalDate startDate = LocalDate.of(2024, 1, 1); // Monday
        LocalDate endDate = LocalDate.of(2024, 1, 7); // Sunday
        LocalDate taskDate = LocalDate.of(2024, 1, 3);

        AddScheduleForDailyPeriodTaskDTO dto = new AddScheduleForDailyPeriodTaskDTO();
        dto.setUserId(testUser.getId());
        dto.setTaskId(9999L);
        dto.setWeekStartDate(startDate);
        dto.setWeekEndDate(endDate);
        dto.setTaskDate(taskDate);

        assertThrows(EntityNotFoundException.class, () ->
                scheduleService.validateAddScheduleForDailyPeriodTask(dto, false, startDate, endDate, taskDate));
    }

    @Test
    public void shouldThrowWhenTaskNotOccurringOnGivenDayOfWeek() {
        LocalDate startDate = LocalDate.of(2024, 1, 1); // Monday
        LocalDate endDate = LocalDate.of(2024, 1, 7); // Sunday
        LocalDate taskDate = LocalDate.of(2024, 1, 6); // Saturday

        AddScheduleForDailyPeriodTaskDTO dto = new AddScheduleForDailyPeriodTaskDTO();
        dto.setUserId(testUser.getId());
        dto.setTaskId(testTask.getId());
        dto.setWeekStartDate(startDate);
        dto.setWeekEndDate(endDate);
        dto.setTaskDate(taskDate);

        assertThrows(IllegalArgumentException.class, () ->
                scheduleService.validateAddScheduleForDailyPeriodTask(dto, false, startDate, endDate, taskDate));
    }

    @Test
    public void shouldThrowWhenTaskAlreadyAssignedToUserOnGivenDay() {
        LocalDate taskDate = LocalDate.of(2024, 2, 28);

        Schedule existingSchedule = new Schedule(testTask, testUser, taskDate);
        scheduleService.save(existingSchedule);

        AddScheduleForDailyPeriodTaskDTO dto = new AddScheduleForDailyPeriodTaskDTO();
        dto.setUserId(testUser.getId());
        dto.setTaskId(testTask.getId());
        LocalDate startDate = LocalDate.of(2024, 2, 26);
        LocalDate endDate = LocalDate.of(2024, 3, 3);

        dto.setWeekStartDate(startDate);
        dto.setWeekEndDate(endDate);
        dto.setTaskDate(taskDate);

        assertThrows(EntityAlreadyExistsException.class, () ->
                scheduleService.validateAddScheduleForDailyPeriodTask(dto, false, startDate, endDate, taskDate));
    }

    @Test
    public void shouldThrowRoleNotMeetRequirementsExceptionForUserWithoutRequiredRole() {
        LocalDate startDate = LocalDate.of(2024, 1, 1); // Monday
        LocalDate endDate = LocalDate.of(2024, 1, 7); // Sunday
        LocalDate taskDate = LocalDate.of(2024, 1, 3); // Wednesday

        User testUser2 = new User();
        testUser2.setEmail("test@example.com");
        testUser2.setName("Test");
        testUser2.setSurname("User");
        testUser2.setRoles(Set.of());
        userRepository.save(testUser2);

        AddScheduleForDailyPeriodTaskDTO dto = new AddScheduleForDailyPeriodTaskDTO();
        dto.setUserId(testUser2.getId());
        dto.setTaskId(testTask.getId());
        dto.setWeekStartDate(startDate);
        dto.setWeekEndDate(endDate);
        dto.setTaskDate(taskDate);

        assertThrows(RoleNotMeetRequirementsException.class, () ->
                scheduleService.validateAddScheduleForDailyPeriodTask(dto, false, startDate, endDate, taskDate));
    }

}

