package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.repository.TaskRepository;

import java.util.Collections;
import java.util.List;

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

    @Test
    public void getAllTasks_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));
    }

    @Test
    public void getTaskById_WithExistingId_ShouldReturnOk() throws Exception {
        Task task = addTestTask();

        mockMvc.perform(get("/api/tasks/" + task.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(task.getId().intValue())));
    }

    @Test
    public void getTaskById_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/tasks/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void createTask_WithValidData_ShouldReturnCreated() throws Exception {
        String taskJson = "{\"name\":\"New Task\",\"category\":\"General\",\"participantsLimit\":10,\"permanent\":false,\"participantForWholePeriod\":true,\"allowedRoleNames\":[\"ROLE_USER\"],\"daysOfWeek\":[\"MONDAY\",\"WEDNESDAY\"]}";

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskJson))
                .andExpect(status().isCreated());

        List<Task> tasks = taskRepository.findAll();
        assertTrue(tasks.stream().anyMatch(t -> "New Task".equals(t.getName())));
    }

    @Test
    public void createTask_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        String taskJson = "{\"name\":\"\",\"category\":\"\",\"participantsLimit\":-1,\"permanent\":false,\"participantForWholePeriod\":true,\"allowedRoleNames\":[],\"daysOfWeek\":[]}";

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateTask_WithExistingId_ShouldReturnOk() throws Exception {
        Task task = addTestTask();
        String updatedTaskJson = "{\"name\":\"Updated Task\",\"category\":\"Updated Category\",\"participantsLimit\":15,\"permanent\":true,\"participantForWholePeriod\":false,\"allowedRoleNames\":[\"ROLE_ADMIN\"],\"daysOfWeek\":[\"TUESDAY\",\"THURSDAY\"]}";

        mockMvc.perform(put("/api/tasks/" + task.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedTaskJson))
                .andExpect(status().isNoContent());

        Task updatedTask = taskRepository.findById(task.getId()).orElse(null);
        assert updatedTask != null;
        assertEquals("Updated Task", updatedTask.getName());
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
        Task task = addTestTask();

        mockMvc.perform(delete("/api/tasks/" + task.getId()))
                .andExpect(status().isNoContent());

        boolean exists = taskRepository.existsById(task.getId());
        assertFalse(exists);
    }

    @Test
    public void deleteTask_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(delete("/api/tasks/9999"))
                .andExpect(status().isNotFound());
    }

    private Task addTestTask() {
        Task task = new Task();
        task.setName("Sample Task");
        task.setCategory("Sample Category");
        task.setParticipantsLimit(5);
        task.setPermanent(false);
        task.setParticipantForWholePeriod(true);
        task.setAllowedRoles(Collections.emptySet());
        task.setDaysOfWeek(Collections.emptySet());
        return taskRepository.save(task);
    }
}