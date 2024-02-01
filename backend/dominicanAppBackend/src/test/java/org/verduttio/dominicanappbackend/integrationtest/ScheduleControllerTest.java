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
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), Set.of(roleUser));
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"date\":\"2024-01-10\"}";

        mockMvc.perform(post("/api/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isCreated());

        databaseInitializer.clearDb();
    }

    @Test
    public void createSchedule_WithTaskWhichIsInConflict_ShouldReturnConflict() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), Set.of(roleUser));
        Task prepareMeal = databaseInitializer.addPrepareMealTask(Set.of(roleUser), Set.of(roleUser));
        databaseInitializer.addConflict(task, prepareMeal);
        databaseInitializer.addSchedule(user, prepareMeal, LocalDate.of(2024, 1, 10));
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"date\":\"2024-01-10\"}";

        mockMvc.perform(post("/api/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isConflict());

        databaseInitializer.clearDb();
    }

    @Test
    public void createSchedule_WithTaskWhichIsInConflictButOnOtherDay_ShouldReturnCreated() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), Set.of(roleUser));
        Task prepareMeal = databaseInitializer.addPrepareMealTask(Set.of(roleUser), Set.of(roleUser));
        databaseInitializer.addConflict(task, prepareMeal);
        Schedule schedule = databaseInitializer.addSchedule(user, prepareMeal, LocalDate.of(2024, 1, 11));
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"date\":\"2024-01-10\"}";

        mockMvc.perform(post("/api/schedules")
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
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), Set.of(roleUser));
        Task prepareMeal = databaseInitializer.addPrepareMealTask(Set.of(roleUser), Set.of(roleUser));
        databaseInitializer.addConflict(task, prepareMeal);
        Schedule schedule = databaseInitializer.addSchedule(user, prepareMeal, LocalDate.of(2024, 1, 10));
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"date\":\"2024-01-10\"}";

        mockMvc.perform(post("/api/schedules?ignoreConflicts=true")
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
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), Set.of(roleUser));
        databaseInitializer.addObstacle_01_01_To_01_20(user, task);
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"date\":\"2024-01-10\"}";

        mockMvc.perform(post("/api/schedules")
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
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleAdmin), Set.of(roleUser));
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"date\":\"2024-01-10\"}";

        mockMvc.perform(post("/api/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isConflict());

        databaseInitializer.clearDb();
    }

    @Test
    public void createSchedule_WithUserNotFound_ShouldReturnNotFound() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), Set.of(roleUser));
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId()+1 + ",\"date\":\"2024-01-10\"}";

        mockMvc.perform(post("/api/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isNotFound());

        databaseInitializer.clearDb();
    }

    @Test
    public void createSchedule_WithTaskNotFound_ShouldReturnNotFound() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), Set.of(roleUser));
        String scheduleJson = "{\"taskId\":" + task.getId()+1 + ",\"userId\":" + user.getId() + ",\"date\":\"2024-01-10\"}";

        mockMvc.perform(post("/api/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isNotFound());

        databaseInitializer.clearDb();
    }



    @Test
    public void updateSchedule_WithExistingId_ShouldReturnOk() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), Set.of(roleUser));
        LocalDate date = LocalDate.of(2024, 1, 3);
        Schedule schedule = databaseInitializer.addSchedule(user, task, date);

        String updatedScheduleJson = "{\"taskId\":" + schedule.getTask().getId() + ",\"userId\":" + schedule.getUser().getId() + ",\"date\":\"2024-01-08\"}";

        mockMvc.perform(put("/api/schedules/" + schedule.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedScheduleJson))
                .andExpect(status().isOk());

        databaseInitializer.clearDb();
    }

    @Test
    public void deleteSchedule_WithExistingId_ShouldReturnNoContent() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser), Set.of(roleUser));
        LocalDate date = LocalDate.of(2024, 1, 4);
        Schedule schedule = databaseInitializer.addSchedule(user, task, date);

        mockMvc.perform(delete("/api/schedules/" + schedule.getId()))
                .andExpect(status().isNoContent());

        databaseInitializer.clearDb();
    }

}
