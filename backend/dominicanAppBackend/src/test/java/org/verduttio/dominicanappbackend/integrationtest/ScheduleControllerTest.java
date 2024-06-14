package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.verduttio.dominicanappbackend.entity.*;
import org.verduttio.dominicanappbackend.integrationtest.utility.DatabaseInitializer;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("integration_tests")
public class ScheduleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private DatabaseInitializer databaseInitializer;

    @Test
    public void getAllSchedules_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/schedules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));
    }

    @Test
    public void createSchedule_WithValidData_ShouldReturnCreated() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), roleUser);
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"taskDate\":\"2024-01-10\"" + ", \"weekStartDate\":\"2024-01-07\"" + ", \"weekEndDate\":\"2024-01-13\"}";

        mockMvc.perform(post("/api/schedules/forDailyPeriod")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isCreated());

        databaseInitializer.clearDb();
    }

    @Test
    public void createSchedule_WithTaskWhichIsInConflict_ShouldReturnConflict() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), roleUser);
        Task prepareMeal = databaseInitializer.addPrepareMealTask(Set.of(roleUser), roleUser);
        Set<DayOfWeek> conflictDaysOfWeek = Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY);
        databaseInitializer.addConflict(task, prepareMeal, conflictDaysOfWeek);
        databaseInitializer.addSchedule(user, prepareMeal, LocalDate.of(2024, 1, 10));
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"taskDate\":\"2024-01-10\"" + ", \"weekStartDate\":\"2024-01-07\"" + ", \"weekEndDate\":\"2024-01-13\"}";

        mockMvc.perform(post("/api/schedules/forDailyPeriod")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isConflict());

        databaseInitializer.clearDb();
    }

    @Test
    public void createSchedule_WithTaskWhichIsInConflictButOnOtherDay_ShouldReturnCreated() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), roleUser);
        Task prepareMeal = databaseInitializer.addPrepareMealTask(Set.of(roleUser), roleUser);
        Set<DayOfWeek> conflictDaysOfWeek = Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY);
        databaseInitializer.addConflict(task, prepareMeal, conflictDaysOfWeek);
        Schedule schedule = databaseInitializer.addSchedule(user, prepareMeal, LocalDate.of(2024, 1, 11));
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"taskDate\":\"2024-01-10\"" + ", \"weekStartDate\":\"2024-01-07\"" + ", \"weekEndDate\":\"2024-01-13\"}";

        mockMvc.perform(post("/api/schedules/forDailyPeriod")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isCreated());

        Schedule createdSchedule = scheduleRepository.findById(schedule.getId()+1).orElse(null);
        assert createdSchedule != null;
        assertEquals(task.getId(), createdSchedule.getTask().getId());
        assertEquals(user.getId(), createdSchedule.getUser().getId());
        assertEquals(LocalDate.of(2024, 1, 10), createdSchedule.getDate());

        databaseInitializer.clearDb();
    }

    @Test
    public void createSchedule_WithTaskWhichIsInConflictWithIgnoreConflictsFlag_ShouldReturnCreated() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), roleUser);
        Task prepareMeal = databaseInitializer.addPrepareMealTask(Set.of(roleUser), roleUser);
        Set<DayOfWeek> conflictDaysOfWeek = Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY);
        databaseInitializer.addConflict(task, prepareMeal, conflictDaysOfWeek);
        Schedule schedule = databaseInitializer.addSchedule(user, prepareMeal, LocalDate.of(2024, 1, 10));
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"taskDate\":\"2024-01-10\"" + ", \"weekStartDate\":\"2024-01-07\"" + ", \"weekEndDate\":\"2024-01-13\"}";

        mockMvc.perform(post("/api/schedules/forDailyPeriod?ignoreConflicts=true")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isCreated());

        Schedule createdSchedule = scheduleRepository.findById(schedule.getId()+1).orElse(null);

        assert createdSchedule != null;
        assertEquals(task.getId(), createdSchedule.getTask().getId());
        assertEquals(user.getId(), createdSchedule.getUser().getId());
        assertEquals(LocalDate.of(2024, 1, 10), createdSchedule.getDate());

        databaseInitializer.clearDb();
    }

    @Test
    public void createSchedule_WithUserWithObstacleForTask_ShouldReturnConflict() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), roleUser);
        databaseInitializer.addObstacle_01_01_To_01_20(user, task);
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"taskDate\":\"2024-01-10\"" + ", \"weekStartDate\":\"2024-01-07\"" + ", \"weekEndDate\":\"2024-01-13\"}";

        mockMvc.perform(post("/api/schedules/forDailyPeriod")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isConflict());

        databaseInitializer.clearDb();
    }

    @Test
    public void createSchedule_WithUserWithoutAllowedRoleForTask_ShouldReturnConflict() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Role roleAdmin = databaseInitializer.addRoleAdmin();
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleAdmin), roleUser);
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"taskDate\":\"2024-01-10\"" + ", \"weekStartDate\":\"2024-01-07\"" + ", \"weekEndDate\":\"2024-01-13\"}";

        mockMvc.perform(post("/api/schedules/forDailyPeriod")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isConflict());

        databaseInitializer.clearDb();
    }

    @Test
    public void createSchedule_WithUserNotFound_ShouldReturnNotFound() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), roleUser);
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId()+1 + ",\"taskDate\":\"2024-01-10\"" + ", \"weekStartDate\":\"2024-01-07\"" + ", \"weekEndDate\":\"2024-01-13\"}";

        mockMvc.perform(post("/api/schedules/forDailyPeriod")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isNotFound());

        databaseInitializer.clearDb();
    }

    @Test
    public void createSchedule_WithTaskNotFound_ShouldReturnNotFound() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), roleUser);
        String scheduleJson = "{\"taskId\":" + task.getId()+1 + ",\"userId\":" + user.getId() + ",\"taskDate\":\"2024-01-10\"" + ", \"weekStartDate\":\"2024-01-07\"" + ", \"weekEndDate\":\"2024-01-13\"}";

        mockMvc.perform(post("/api/schedules/forDailyPeriod")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isNotFound());

        databaseInitializer.clearDb();
    }

}
