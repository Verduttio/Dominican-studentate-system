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
import org.verduttio.dominicanappbackend.repository.RoleRepository;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.repository.UserRepository;

import java.time.DayOfWeek;
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

    @Test
    public void getAllSchedules_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/schedules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));
    }

    private void clearDb() {
        scheduleRepository.deleteAll();
        taskRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();
    }

    private User addUserFrankCadillac() {
        User frankCadillac = new User();
        frankCadillac.setName("Frank");
        frankCadillac.setSurname("Cadillac");
        frankCadillac.setEmail("funcadillac@mail.com");
        frankCadillac.setPassword("password");
        frankCadillac.setRoles(Set.of(roleRepository.save(new Role("ROLE_USER"))));
        return userRepository.save(frankCadillac);
    }

    private Task addTestTask() {
        Task task = new Task();
        task.setName("Test Task");
        task.setCategory("Test Category");
        task.setParticipantsLimit(10);
        task.setPermanent(false);
        task.setParticipantForWholePeriod(true);
        task.setAllowedRoles(Set.of(roleRepository.save(new Role("ROLE_USER"))));
        task.setDaysOfWeek(Set.of(DayOfWeek.THURSDAY));
        return taskRepository.save(task);
    }

    private Schedule addTestSchedule() {
        User user = addUserFrankCadillac();
        Task task = addTestTask();

        Schedule schedule = new Schedule();
        schedule.setUser(user);
        schedule.setTask(task);
        schedule.setDate(LocalDate.of(2024, 1, 1));
        return scheduleRepository.save(schedule);
    }

    @Test
    public void createSchedule_WithValidData_ShouldReturnCreated() throws Exception {
        User user = addUserFrankCadillac();
        Task task = addTestTask();
        String scheduleJson = "{\"taskId\":" + task.getId() + ",\"userId\":" + user.getId() + ",\"date\":\"2024-01-04\"}";

        mockMvc.perform(post("/api/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduleJson))
                .andExpect(status().isCreated());

        clearDb();
    }

    @Test
    public void updateSchedule_WithExistingId_ShouldReturnOk() throws Exception {
        Schedule schedule = addTestSchedule();
        String updatedScheduleJson = "{\"taskId\":" + schedule.getTask().getId() + ",\"userId\":" + schedule.getUser().getId() + ",\"date\":\"2024-01-04\"}";

        mockMvc.perform(put("/api/schedules/" + schedule.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedScheduleJson))
                .andExpect(status().isOk());

        clearDb();
    }

    @Test
    public void deleteSchedule_WithExistingId_ShouldReturnNoContent() throws Exception {
        Schedule schedule = addTestSchedule();

        mockMvc.perform(delete("/api/schedules/" + schedule.getId()))
                .andExpect(status().isNoContent());

        clearDb();
    }

}
