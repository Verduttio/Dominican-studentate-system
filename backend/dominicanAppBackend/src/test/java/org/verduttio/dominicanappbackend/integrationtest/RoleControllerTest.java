package org.verduttio.dominicanappbackend.integrationtest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.integrationtest.utility.DatabaseInitializer;
import org.verduttio.dominicanappbackend.repository.RoleRepository;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("integration_tests")
public class RoleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DatabaseInitializer databaseInitializer;

    @Test
    public void getAllRoles_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));
    }

    @Test
    public void getRoleById_WithExistingId_ShouldReturnOk() throws Exception {
        Role role = databaseInitializer.addRoleUser();

        mockMvc.perform(get("/api/roles/" + role.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(role.getId().intValue())));

        databaseInitializer.clearDb();
    }

    @Test
    public void getRoleById_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/roles/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void createRole_WithValidData_ShouldReturnCreated() throws Exception {
        String roleJson = "{\"name\":\"New Role\"}";

        mockMvc.perform(post("/api/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(roleJson))
                .andExpect(status().isCreated());

        List<Role> roles = roleRepository.findAll();
        assertTrue(roles.stream().anyMatch(r -> "New Role".equals(r.getName())));

        databaseInitializer.clearDb();
    }

    @Test
    public void updateRole_WithExistingId_ShouldReturnOk() throws Exception {
        Role role = databaseInitializer.addRoleUser();
        String updatedRoleJson = "{\"name\":\"Updated Role\"}";

        mockMvc.perform(put("/api/roles/" + role.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedRoleJson))
                .andExpect(status().isNoContent());

        Role updatedRole = roleRepository.findById(role.getId()).orElse(null);
        assertNotNull(updatedRole);
        assertEquals("Updated Role", updatedRole.getName());

        databaseInitializer.clearDb();
    }

    @Test
    public void updateRole_WithNotExistingId_ShouldReturnNotFound() throws Exception {
        String updatedRoleJson = "{\"name\":\"Updated Role\"}";

        mockMvc.perform(put("/api/roles/" + '0')
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedRoleJson))
                .andExpect(status().isNotFound());

        databaseInitializer.clearDb();
    }

    @Test
    public void deleteRole_WithExistingId_ShouldReturnNoContent() throws Exception {
        Role role = databaseInitializer.addRoleUser();

        mockMvc.perform(delete("/api/roles/" + role.getId()))
                .andExpect(status().isNoContent());
        assertFalse(roleRepository.existsById(role.getId()));

        databaseInitializer.clearDb();
    }
}
