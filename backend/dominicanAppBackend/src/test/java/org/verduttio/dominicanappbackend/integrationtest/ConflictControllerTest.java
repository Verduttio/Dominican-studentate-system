package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;
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
public class ConflictControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConflictRepository conflictRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Test
    public void getAllConflicts_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/conflicts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));
    }

    @Test
    public void getConflictById_WithExistingId_ShouldReturnOk() throws Exception {
        Task washDishes = addWashDishesTask();
        Task prepareMeal = addPrepareMealTask();
        Conflict conflict = addTestConflict();

        mockMvc.perform(get("/api/conflicts/" + conflict.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(conflict.getId().intValue())));

        clearDb();
    }

    @Test
    public void getConflictById_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/conflicts/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void createConflict_WithValidData_ShouldReturnCreated() throws Exception {
        Task washDishes = addWashDishesTask();
        Task prepareMeal = addPrepareMealTask();

        String conflictJson = "{\"task1Id\":"+washDishes.getId()+", \"task2Id\":"+prepareMeal.getId()+"}";
        mockMvc.perform(post("/api/conflicts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(conflictJson))
                .andExpect(status().isCreated());

        List<Conflict> conflicts = conflictRepository.findAll();
        assertTrue(conflicts.stream().anyMatch(c -> c.getTask1().getId() == washDishes.getId() && c.getTask2().getId() == prepareMeal.getId()));

        clearDb();
    }

    @Test
    public void updateConflict_WithExistingId_ShouldReturnOk() throws Exception {
        Task washDishes = addWashDishesTask();
        Task prepareMeal = addPrepareMealTask();
        Conflict conflict = addTestConflict();
        Task dryDishes = addDryDishesTask();

        String updatedConflictJson = "{\"task1Id\":"+conflict.getTask1().getId()+", \"task2Id\":"+dryDishes.getId()+"}";
        mockMvc.perform(put("/api/conflicts/" + conflict.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedConflictJson))
                .andExpect(status().isOk());

        Conflict updatedConflict = conflictRepository.findById(conflict.getId()).orElse(null);
        assertNotNull(updatedConflict);
        assertEquals(dryDishes.getId(), updatedConflict.getTask2().getId());

        clearDb();
    }

    @Test
    public void deleteConflict_WithExistingId_ShouldReturnNoContent() throws Exception {
        Task washDishes = addWashDishesTask();
        Task prepareMeal = addPrepareMealTask();
        Conflict conflict = addTestConflict();

        mockMvc.perform(delete("/api/conflicts/" + conflict.getId()))
                .andExpect(status().isNoContent());

        assertFalse(conflictRepository.existsById(conflict.getId()));

        clearDb();
    }

    private Conflict addTestConflict() {
        Conflict conflict = new Conflict();
        conflict.setTask1(taskRepository.findByName("Wash dishes").get());
        conflict.setTask2(taskRepository.findByName("Prepare meal").get());
        return conflictRepository.save(conflict);
    }

    private Task addWashDishesTask() {
        Task task = new Task();
        task.setName("Wash dishes");
        task.setCategory("Kitchen");
        task.setParticipantsLimit(5);
        task.setPermanent(false);
        task.setParticipantForWholePeriod(true);
        task.setAllowedRoles(Collections.emptySet());
        task.setDaysOfWeek(Collections.emptySet());
        return taskRepository.save(task);
    }

    private Task addPrepareMealTask() {
        Task task = new Task();
        task.setName("Prepare meal");
        task.setCategory("Kitchen");
        task.setParticipantsLimit(15);
        task.setPermanent(false);
        task.setParticipantForWholePeriod(true);
        task.setAllowedRoles(Collections.emptySet());
        task.setDaysOfWeek(Collections.emptySet());
        return taskRepository.save(task);
    }

    private Task addDryDishesTask() {
        Task task = new Task();
        task.setName("Dry dishes");
        task.setCategory("Kitchen");
        task.setParticipantsLimit(12);
        task.setPermanent(false);
        task.setParticipantForWholePeriod(true);
        task.setAllowedRoles(Collections.emptySet());
        task.setDaysOfWeek(Collections.emptySet());
        return taskRepository.save(task);
    }

    private void clearDb() {
        conflictRepository.deleteAll();
        taskRepository.deleteAll();
    }
}