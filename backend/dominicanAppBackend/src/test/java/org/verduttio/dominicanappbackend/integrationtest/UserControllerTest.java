package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.verduttio.dominicanappbackend.dto.UserDTO;
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
    }

    private void addUserFrankCadillac() {
        UserDTO baseUser = new UserDTO();
        baseUser.setName("Frank");
        baseUser.setSurname("Cadillac");
        baseUser.setEmail("funcadillac@mail.com");
        baseUser.setPassword("password");
        baseUser.setRoleNames(Set.of("ROLE_USER"));
        userService.createUser(baseUser);
    }

    @Test
    public void postUser_WithEmailTaken_ShouldReturnConflict() throws Exception {
        addUserFrankCadillac();

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
    }
}
