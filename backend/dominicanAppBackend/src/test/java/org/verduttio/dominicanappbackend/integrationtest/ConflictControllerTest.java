package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.verduttio.dominicanappbackend.domain.Conflict;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.integrationtest.utility.DatabaseInitializer;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
    private DatabaseInitializer databaseInitializer;

    @Test
    public void getAllConflicts_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/conflicts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));
    }

    @Test
    public void getConflictById_WithExistingId_ShouldReturnOk() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        Task washDishes = databaseInitializer.addWashDishesTask(Set.of(roleUser), roleUser);
        Task prepareMeal = databaseInitializer.addPrepareMealTask(Set.of(roleUser), roleUser);
        Set<DayOfWeek> conflictDaysOfWeek = Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY);
        Conflict conflict = databaseInitializer.addConflict(washDishes, prepareMeal, conflictDaysOfWeek);

        mockMvc.perform(get("/api/conflicts/" + conflict.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(conflict.getId().intValue())));

        databaseInitializer.clearDb();
    }

    @Test
    public void getConflictById_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/conflicts/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void createConflict_WithValidData_ShouldReturnCreated() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        Task washDishes = databaseInitializer.addWashDishesTask(Set.of(roleUser), roleUser);
        Task prepareMeal = databaseInitializer.addPrepareMealTask(Set.of(roleUser), roleUser);
        List<DayOfWeek> conflictDaysOfWeek = List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY);
        String conflictDaysOfWeekString = conflictDaysOfWeek.stream().map(day -> "\"" + day + "\"").collect(Collectors.joining(","));

        String conflictJson = "{\"task1Id\":"+washDishes.getId()+", \"task2Id\":"+prepareMeal.getId()+", \"daysOfWeek\":["+conflictDaysOfWeekString+"]"+ "}";
        mockMvc.perform(post("/api/conflicts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(conflictJson))
                .andExpect(status().isCreated());

        List<Conflict> conflicts = conflictRepository.findAll();
        assertTrue(conflicts.stream().anyMatch(c -> c.getTask1().getId().equals(washDishes.getId()) && c.getTask2().getId().equals(prepareMeal.getId())));

        databaseInitializer.clearDb();
    }

    @Test
    public void createConflict_WhichAlreadyExists_ShouldReturnConflict() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        Task washDishes = databaseInitializer.addWashDishesTask(Set.of(roleUser), roleUser);
        Task prepareMeal = databaseInitializer.addPrepareMealTask(Set.of(roleUser), roleUser);
        Set<DayOfWeek> conflictDaysOfWeek = Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY);
        databaseInitializer.addConflict(washDishes, prepareMeal, conflictDaysOfWeek);

        String conflictJson = "{\"task1Id\":"+washDishes.getId()+", \"task2Id\":"+prepareMeal.getId()+", \"daysOfWeek\":[\"MONDAY\",\"TUESDAY\",\"WEDNESDAY\"]}";
        mockMvc.perform(post("/api/conflicts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(conflictJson))
                .andExpect(status().isConflict());

        databaseInitializer.clearDb();
    }

    @Test
    public void updateConflict_WithExistingId_ShouldReturnOk() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        Task washDishes = databaseInitializer.addWashDishesTask(Set.of(roleUser), roleUser);
        Task prepareMeal = databaseInitializer.addPrepareMealTask(Set.of(roleUser), roleUser);
        Set<DayOfWeek> conflictDaysOfWeek = Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY);
        Conflict conflict = databaseInitializer.addConflict(washDishes, prepareMeal, conflictDaysOfWeek);
        Task dryDishes = databaseInitializer.addDryDishesTask(Set.of(roleUser), roleUser);

        String updatedConflictJson = "{\"task1Id\":"+conflict.getTask1().getId()+", \"task2Id\":"+dryDishes.getId()+", \"daysOfWeek\":[\"MONDAY\",\"TUESDAY\",\"WEDNESDAY\"]}";
        mockMvc.perform(put("/api/conflicts/" + conflict.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedConflictJson))
                .andExpect(status().isOk());

        Conflict updatedConflict = conflictRepository.findById(conflict.getId()).orElse(null);
        assertNotNull(updatedConflict);
        assertEquals(dryDishes.getId(), updatedConflict.getTask2().getId());

        databaseInitializer.clearDb();
    }

    @Test
    public void deleteConflict_WithExistingId_ShouldReturnNoContent() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        Task washDishes = databaseInitializer.addWashDishesTask(Set.of(roleUser), roleUser);
        Task prepareMeal = databaseInitializer.addPrepareMealTask(Set.of(roleUser), roleUser);
        Set<DayOfWeek> conflictDaysOfWeek = Set.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY);
        Conflict conflict = databaseInitializer.addConflict(washDishes, prepareMeal, conflictDaysOfWeek);

        mockMvc.perform(delete("/api/conflicts/" + conflict.getId()))
                .andExpect(status().isNoContent());

        assertFalse(conflictRepository.existsById(conflict.getId()));

        databaseInitializer.clearDb();
    }
}