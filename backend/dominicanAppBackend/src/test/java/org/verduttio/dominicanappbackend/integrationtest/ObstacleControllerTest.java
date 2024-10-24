package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.verduttio.dominicanappbackend.domain.*;
import org.verduttio.dominicanappbackend.domain.obstacle.Obstacle;
import org.verduttio.dominicanappbackend.integrationtest.utility.DatabaseInitializer;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;

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
public class ObstacleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObstacleRepository obstacleRepository;

    @Autowired
    private DatabaseInitializer databaseInitializer;

    @Test
    public void getAllObstacles_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/obstacles/pageable"))
                .andExpect(status().isOk());
    }

    @Test
    public void getObstacleById_WithExistingId_ShouldReturnOk() throws Exception {
        Role role = databaseInitializer.addRoleUser();
        User frankCadillac = databaseInitializer.addUserFrankCadillac(Set.of(role));
        Task task = databaseInitializer.addDryDishesTask(Set.of(role), role);
        Obstacle obstacle = databaseInitializer.addObstacle_01_01_To_01_20(frankCadillac, task);

        int pageNumber = 0;
        int pageSize = 10;

        mockMvc.perform(get("/api/obstacles/pageable?page=" + pageNumber + "&size=" + pageSize))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].id", hasItem(obstacle.getId().intValue())));

        databaseInitializer.clearDb();
    }

    @Test
    public void getObstacleById_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/obstacles/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void createObstacle_WithValidData_ShouldReturnCreated() throws Exception {
        Role role = databaseInitializer.addRoleUser();
        User frankCadillac = databaseInitializer.addUserFrankCadillac(Set.of(role));
        Task task = databaseInitializer.addDryDishesTask(Set.of(role), role);


        String obstacleJson = "{\"userId\":"+frankCadillac.getId()+",\"tasksIds\":["+task.getId()+"],\"fromDate\":\"2024-01-01\",\"toDate\":\"2024-01-02\",\"applicantDescription\":\"Test Description\"}";

        mockMvc.perform(post("/api/obstacles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(obstacleJson))
                .andExpect(status().isCreated());

        List<Obstacle> obstacles = obstacleRepository.findAll();
        assertTrue(obstacles.stream().anyMatch(o -> "Test Description".equals(o.getApplicantDescription())));

        databaseInitializer.clearDb();
    }

    @Test
    public void createObstacle_WithInvalidDates_ShouldReturnBadRequest() throws Exception {
        Role role = databaseInitializer.addRoleUser();
        User frankCadillac = databaseInitializer.addUserFrankCadillac(Set.of(role));
        Task task = databaseInitializer.addDryDishesTask(Set.of(role), role);


        String obstacleJson = "{\"userId\":"+frankCadillac.getId()+",\"taskId\":"+task.getId()+",\"fromDate\":\"2024-01-30\",\"toDate\":\"2024-01-02\",\"applicantDescription\":\"Test Description\"}";

        mockMvc.perform(post("/api/obstacles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(obstacleJson))
                .andExpect(status().isBadRequest());

        databaseInitializer.clearDb();
    }

    @Test
    public void createObstacle_WithNotExistingUser_ShouldReturnNotFound() throws Exception {
        Role role = databaseInitializer.addRoleUser();
        Task task = databaseInitializer.addDryDishesTask(Set.of(role), role);


        String obstacleJson = "{\"userId\":"+'0'+",\"tasksIds\":["+task.getId()+"],\"fromDate\":\"2024-01-30\",\"toDate\":\"2024-01-02\",\"applicantDescription\":\"Test Description\"}";

        mockMvc.perform(post("/api/obstacles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(obstacleJson))
                .andExpect(status().isNotFound());

        databaseInitializer.clearDb();
    }

    @Test
    public void createObstacle_WithNotExistingTask_ShouldReturnNotFound() throws Exception {
        Role role = databaseInitializer.addRoleUser();
        User frankCadillac = databaseInitializer.addUserFrankCadillac(Set.of(role));


        String obstacleJson = "{\"userId\":"+frankCadillac.getId()+",\"tasksIds\":["+'0'+"],\"fromDate\":\"2024-01-30\",\"toDate\":\"2024-01-02\",\"applicantDescription\":\"Test Description\"}";

        mockMvc.perform(post("/api/obstacles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(obstacleJson))
                .andExpect(status().isNotFound());

        databaseInitializer.clearDb();
    }

    @Test
    public void updateObstacle_WithExistingId_ShouldReturnOk() throws Exception {
        Role role = databaseInitializer.addRoleUser();
        User frankCadillac = databaseInitializer.addUserFrankCadillac(Set.of(role));
        Task task = databaseInitializer.addDryDishesTask(Set.of(role), role);
        Obstacle obstacle = databaseInitializer.addObstacle_01_01_To_01_20(frankCadillac, task);
        User johnDoe = databaseInitializer.addUserJohnDoe(Set.of(role));

        String updatedObstacleJson = "{\"status\":\"APPROVED\",\"recipientAnswer\":\"Approved\",\"recipientUserId\":"+johnDoe.getId()+"}";

        mockMvc.perform(patch("/api/obstacles/" + obstacle.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedObstacleJson))
                .andExpect(status().isOk());

        Obstacle updatedObstacle = obstacleRepository.findById(obstacle.getId()).orElse(null);
        assertNotNull(updatedObstacle);
        assertEquals(ObstacleStatus.APPROVED, updatedObstacle.getStatus());

        databaseInitializer.clearDb();
    }

    @Test
    public void updateObstacle_WithNotExistingRecipientUserId_ShouldReturnNotFound() throws Exception {
        Role role = databaseInitializer.addRoleUser();
        User frankCadillac = databaseInitializer.addUserFrankCadillac(Set.of(role));
        Task task = databaseInitializer.addDryDishesTask(Set.of(role), role);
        Obstacle obstacle = databaseInitializer.addObstacle_01_01_To_01_20(frankCadillac, task);

        String updatedObstacleJson = "{\"status\":\"APPROVED\",\"recipientAnswer\":\"Approved\",\"recipientUserId\":"+'0'+"}";

        mockMvc.perform(patch("/api/obstacles/" + obstacle.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedObstacleJson))
                .andExpect(status().isNotFound());

        databaseInitializer.clearDb();
    }

    @Test
    public void updateObstacle_WithInvalidStatus_ShouldReturnBadRequest() throws Exception {
        Role role = databaseInitializer.addRoleUser();
        User frankCadillac = databaseInitializer.addUserFrankCadillac(Set.of(role));
        Task task = databaseInitializer.addDryDishesTask(Set.of(role), role);
        Obstacle obstacle = databaseInitializer.addObstacle_01_01_To_01_20(frankCadillac, task);

        String updatedObstacleJson = "{\"status\":\"APROVED\",\"recipientAnswer\":\"Approved\",\"recipientUserId\":"+frankCadillac.getId()+"}";

        mockMvc.perform(patch("/api/obstacles/" + obstacle.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedObstacleJson))
                .andExpect(status().isBadRequest());

        databaseInitializer.clearDb();
    }

}
