package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.integrationtest.utility.DatabaseInitializer;
import org.verduttio.dominicanappbackend.repository.TaskRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("integration_tests")
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private DatabaseInitializer databaseInitializer;

    @Test
    public void getAllTasks_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));
    }

    @Test
    public void getTaskById_WithExistingId_ShouldReturnOk() throws Exception {
        Role role = databaseInitializer.addRoleUser();
        Task task = databaseInitializer.addWashDishesTask(Set.of(role));

        mockMvc.perform(get("/api/tasks/" + task.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(task.getId().intValue())));

        databaseInitializer.clearDb();
    }

    @Test
    public void getTaskByRoleName_ShouldReturnOk() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        Role roleAdmin = databaseInitializer.addRoleAdmin();
        Task task = databaseInitializer.addWashDishesTask(Set.of(roleUser, roleAdmin));
        Task task2 = databaseInitializer.addDryDishesTask(Set.of(roleUser));
        databaseInitializer.addPrepareMealTask(Set.of(roleAdmin));

        mockMvc.perform(get("/api/tasks/byRole/" + roleUser.getName()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", anyOf(is(task.getId().intValue()), is(task2.getId().intValue()))))
                .andExpect(jsonPath("$[0].name", anyOf(is(task.getName()), is(task2.getName()))))
                .andExpect(jsonPath("$[1].id", anyOf(is(task.getId().intValue()), is(task2.getId().intValue()))))
                .andExpect(jsonPath("$[1].name", anyOf(is(task.getName()), is(task2.getName()))));

        databaseInitializer.clearDb();
    }

    @Test
    public void getTaskByRoleName_ShouldReturnOkAndEmptySet() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        Role roleAdmin = databaseInitializer.addRoleAdmin();
        Role roleDev = databaseInitializer.addRoleDev();
        databaseInitializer.addWashDishesTask(Set.of(roleUser, roleAdmin));
        databaseInitializer.addDryDishesTask(Set.of(roleUser));
        databaseInitializer.addPrepareMealTask(Set.of(roleAdmin));

        mockMvc.perform(get("/api/tasks/byRole/" + roleDev.getName()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        databaseInitializer.clearDb();
    }

    @Test
    public void getTaskById_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/tasks/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void createTask_WithValidData_ShouldReturnCreated() throws Exception {
        databaseInitializer.addRoleUser();
        String taskJson = "{\"name\":\"New Task\",\"category\":\"General\",\"participantsLimit\":10,\"permanent\":false,\"participantForWholePeriod\":true,\"allowedRoleNames\":[\"ROLE_USER\"],\"daysOfWeek\":[\"MONDAY\",\"WEDNESDAY\"]}";

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskJson))
                .andExpect(status().isCreated());

        List<Task> tasks = taskRepository.findAll();
        assertTrue(tasks.stream().anyMatch(t -> "New Task".equals(t.getName())));

        databaseInitializer.clearDb();
    }

    @Test
    public void createTask_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        String taskJson = "{\"name\":\"\",\"category\":\"\",\"participantsLimit\":-1,\"permanent\":false,\"participantForWholePeriod\":true,\"allowedRoleNames\":[],\"daysOfWeek\":[]}";

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskJson))
                .andExpect(status().isBadRequest());

        databaseInitializer.clearDb();
    }

    @Test
    public void createTask_WithEmptyRoles_ShouldReturnBadRequest() throws Exception {
        String taskJson = "{\"name\":\"Wash dishes\",\"category\":\"kitchen\",\"participantsLimit\":12,\"permanent\":false,\"participantForWholePeriod\":true,\"allowedRoleNames\":[],\"daysOfWeek\":[MONDAY]}";

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskJson))
                .andExpect(status().isBadRequest());

        databaseInitializer.clearDb();
    }

    @Test
    public void createTask_WithInvalidSoEmptyRoles_ShouldReturnBadRequest() throws Exception {
        String taskJson = "{\"name\":\"Wash dishes\",\"category\":\"kitchen\",\"participantsLimit\":12,\"permanent\":false,\"participantForWholePeriod\":true,\"allowedRoleNames\":[\"INVALID_ROLE\"],\"daysOfWeek\":[\"MONDAY\"]}";

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskJson))
                .andExpect(status().isBadRequest());

        databaseInitializer.clearDb();
    }

    @Test
    public void updateTask_WithExistingId_ShouldReturnOk() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        Role roleAdmin = databaseInitializer.addRoleAdmin();
        Task task = databaseInitializer.addWashDishesTask(Set.of(roleUser));

        String updatedTaskJson = "{\"name\":\"Updated Task\",\"category\":\"Updated Category\",\"participantsLimit\":15,\"permanent\":true,\"participantForWholePeriod\":false,\"allowedRoleNames\":[\"ROLE_ADMIN\"],\"daysOfWeek\":[\"TUESDAY\",\"THURSDAY\"]}";

        mockMvc.perform(put("/api/tasks/" + task.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedTaskJson))
                .andExpect(status().isNoContent());

        Task updatedTask = taskRepository.findById(task.getId()).orElse(null);
        assert updatedTask != null;
        assertEquals("Updated Task", updatedTask.getName());
        assertEquals("Updated Category", updatedTask.getCategory());
        assertEquals(15, updatedTask.getParticipantsLimit());
        assertTrue(updatedTask.isPermanent());
        assertFalse(updatedTask.isParticipantForWholePeriod());
        assertEquals(1, updatedTask.getAllowedRoles().size());
        assertTrue(updatedTask.getAllowedRoles().stream().anyMatch(r -> r.getName().equals(roleAdmin.getName())));
        assertEquals(2, updatedTask.getDaysOfWeek().size());
        assertTrue(updatedTask.getDaysOfWeek().containsAll(Set.of(DayOfWeek.TUESDAY, DayOfWeek.THURSDAY)));

        databaseInitializer.clearDb();
    }

    @Test
    public void updateTask_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        String updatedTaskJson = "{\"name\":\"Updated Task\",\"category\":\"Updated Category\",\"participantsLimit\":15,\"permanent\":true,\"participantForWholePeriod\":false,\"allowedRoleNames\":[\"ROLE_ADMIN\"],\"daysOfWeek\":[\"TUESDAY\",\"THURSDAY\"]}";
        mockMvc.perform(put("/api/tasks/9999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedTaskJson))
                .andExpect(status().isNotFound());
    }

    @Test
    public void deleteTask_WithExistingId_ShouldReturnNoContent() throws Exception {
        Role role = databaseInitializer.addRoleUser();
        Task task = databaseInitializer.addWashDishesTask(Set.of(role));

        mockMvc.perform(delete("/api/tasks/" + task.getId()))
                .andExpect(status().isNoContent());

        boolean exists = taskRepository.existsById(task.getId());
        assertFalse(exists);

        databaseInitializer.clearDb();
    }

    @Test
    public void deleteTask_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(delete("/api/tasks/9999"))
                .andExpect(status().isNotFound());
    }
}