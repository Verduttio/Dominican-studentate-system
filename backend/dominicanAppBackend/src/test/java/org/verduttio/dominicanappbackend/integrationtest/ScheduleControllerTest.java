package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.Schedule;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.integrationtest.utility.DatabaseInitializer;
import org.verduttio.dominicanappbackend.repository.RoleRepository;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.repository.UserRepository;

import java.time.LocalDate;
import java.util.Set;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
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
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RoleRepository roleRepository;

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
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser));
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"date\":\"2024-01-10\"}";

        mockMvc.perform(post("/api/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isCreated());

        databaseInitializer.clearDb();
    }

    @Test
    public void updateSchedule_WithExistingId_ShouldReturnOk() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser));
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
        Task task = databaseInitializer.addDryDishesTask(Set.of(roleUser));
        LocalDate date = LocalDate.of(2024, 1, 4);
        Schedule schedule = databaseInitializer.addSchedule(user, task, date);

        mockMvc.perform(delete("/api/schedules/" + schedule.getId()))
                .andExpect(status().isNoContent());

        databaseInitializer.clearDb();
    }

}
