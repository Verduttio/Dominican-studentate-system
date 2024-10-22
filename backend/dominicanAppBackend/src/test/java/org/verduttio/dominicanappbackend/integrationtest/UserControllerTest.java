package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.session.Session;
import org.springframework.session.security.SpringSessionBackedSessionRegistry;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.integrationtest.utility.DatabaseInitializer;
import org.verduttio.dominicanappbackend.repository.UserRepository;

import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("integration_tests")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DatabaseInitializer databaseInitializer;

    @Autowired
    private SpringSessionBackedSessionRegistry<? extends Session> sessionRegistry;

    @Test
    public void getAllUsers_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));
    }

    @Test
    public void getUserById_WithExistingId_ShouldReturnOk() throws Exception {
        User user = databaseInitializer.addUserFrankCadillac(Set.of(databaseInitializer.addRoleUser()));

        mockMvc.perform(get("/api/users/" + user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(user.getId().intValue())));

        databaseInitializer.clearDb();
    }

    @Test
    public void getUserById_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/users/9999"))
                .andExpect(status().isNotFound());
    }

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
        databaseInitializer.addUserFrankCadillac(Set.of(roleUser));

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

    @Test
    public void postUser_WithInvalidEmail_ShouldReturnBadRequest() throws Exception {
        databaseInitializer.addRoleUser();

        String userJson = "{"
                + "\"name\":\"John\","
                + "\"surname\":\"Doe\","
                + "\"email\":\"johnDoe\","
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
    public void putUser_WithExistingId_ShouldReturnOk() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));
        databaseInitializer.addRoleAdmin();

        String updatedUserJson = "{"
                + "\"name\":\"John\","
                + "\"surname\":\"Doe\","
                + "\"email\":\"john@mail.com\","
                + "\"password\":\"password2\","
                + "\"roleNames\":[\"ROLE_ADMIN\"]"
                + "}";

        mockMvc.perform(MockMvcRequestBuilders.put("/api/users/" + user.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedUserJson))
                .andExpect(status().isNoContent());

        User updatedUser = userRepository.findById(user.getId()).orElse(null);
        List<User> users = userRepository.findAll();
        for (User u : users) {
            System.out.println(u.getName());
        }
        assertNotNull(updatedUser);
        assertEquals("John", updatedUser.getName());
        assertEquals("Doe", updatedUser.getSurname());
        assertEquals("john@mail.com", updatedUser.getEmail());
        assertEquals("password2", updatedUser.getPassword());
        assertEquals(1, updatedUser.getRoles().size());
        assertTrue(updatedUser.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName())));

        databaseInitializer.clearDb();
    }

    @Test
    public void deleteUser_WithExistingId_ShouldReturnNoContent() throws Exception {
        Role roleUser = databaseInitializer.addRoleUser();
        User user = databaseInitializer.addUserFrankCadillac(Set.of(roleUser));

        mockMvc.perform(delete("/api/users/" + user.getId()))
                .andExpect(status().isNoContent());
        assertFalse(userRepository.existsById(user.getId()));

        databaseInitializer.clearDb();
    }

}
