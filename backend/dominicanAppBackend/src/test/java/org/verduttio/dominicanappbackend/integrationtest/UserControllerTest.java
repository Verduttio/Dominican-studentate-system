package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.verduttio.dominicanappbackend.controller.UserController;
import org.verduttio.dominicanappbackend.dto.UserDTO;

import java.util.Set;

@SpringBootTest
@ActiveProfiles("integration_tests")
public class UserControllerTest {

    @Autowired
    private UserController userController;

    @Test
    public void saveUser() {
        UserDTO userDTO = new UserDTO();
        userDTO.setName("John");
        userDTO.setSurname("Doe");
        userDTO.setEmail("johnDoe@mymail.com");
        userDTO.setPassword("password");
        userDTO.setRoleNames(Set.of("ROLE_USER"));

        ResponseEntity<?> response = userController.createUser(userDTO);

        Assertions.assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }
}
