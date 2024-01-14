package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.integrationtest.utility.DatabaseInitializer;
import org.verduttio.dominicanappbackend.service.UserService;

import java.util.Set;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("integration_tests")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private DatabaseInitializer databaseInitializer;

    @Test
    public void postUser_WithEmptySurname_ShouldReturnBadRequest() throws Exception {
        String userJson = "{"
                + "\"name\":\"John\","
                + "\"surname\":\"\","
                + "\"email\":\"johnDoe@mymail.com\","
                + "\"password\":\"password\","
                + "\"roleNames\":[\"ROLE_USER\"]"
                + "}";

        mockMvc.perform(MockMvcRequestBuilders.post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isBadRequest());

        databaseInitializer.clearDb();
    }

    @Test
    public void postUser_ShouldReturnCreated() throws Exception {
        String userJson = "{"
                + "\"name\":\"John\","
                + "\"surname\":\"Doe\","
                + "\"email\":\"johnDoe@mymail.com\","
                + "\"password\":\"password\","
                + "\"roleNames\":[\"ROLE_USER\"]"
                + "}";

        mockMvc.perform(MockMvcRequestBuilders.post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isCreated());

        databaseInitializer.clearDb();
    }

    @Test
    public void postUser_WithEmailTaken_ShouldReturnConflict() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));

        String userJson = "{"
                + "\"name\":\"John\","
                + "\"surname\":\"Doe\","
                + "\"email\":\"funcadillac@mail.com\","
                + "\"password\":\"password\","
                + "\"roleNames\":[\"ROLE_USER\"]"
                + "}";

        mockMvc.perform(MockMvcRequestBuilders.post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isConflict());

        databaseInitializer.clearDb();
    }
}
