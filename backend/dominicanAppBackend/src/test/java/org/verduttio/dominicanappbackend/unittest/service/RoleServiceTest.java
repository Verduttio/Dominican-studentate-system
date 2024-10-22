package org.verduttio.dominicanappbackend.unittest.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.domain.RoleType;
import org.verduttio.dominicanappbackend.repository.RoleRepository;
import org.verduttio.dominicanappbackend.service.RoleService;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleServiceTest {
    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private RoleService roleService;

    @BeforeEach
    void setup() {
        Role roleAdmin = new Role("ROLE_ADMIN", RoleType.SYSTEM);
        Role roleUser = new Role("ROLE_USER", RoleType.SYSTEM);
        Role roleGuest = new Role("ROLE_GUEST", RoleType.SYSTEM);
        when(roleRepository.findAll()).thenReturn(Arrays.asList(roleAdmin, roleUser, roleGuest));
    }

    @Test
    void getAllRolesWithout_NoExcludedRoles_ReturnsAllRoles() {
        List<Role> expectedRoles = Arrays.asList(new Role("ROLE_ADMIN", RoleType.SYSTEM), new Role("ROLE_USER", RoleType.SYSTEM), new Role("ROLE_GUEST", RoleType.SYSTEM));
        List<Role> rolesWithoutExclusions = roleService.getAllRolesWithout();
        assertEquals(expectedRoles, rolesWithoutExclusions);
    }

    @Test
    void getAllRolesWithout_OneExcludedRole_ExcludesThatRole() {
        List<Role> roles = roleService.getAllRolesWithout("ROLE_ADMIN");
        assertFalse(roles.contains(new Role("ROLE_ADMIN", RoleType.SYSTEM)));
        assertTrue(roles.containsAll(Arrays.asList(new Role("ROLE_USER", RoleType.SYSTEM), new Role("ROLE_GUEST", RoleType.SYSTEM))));
    }

    @Test
    void getAllRolesWithout_MultipleExcludedRoles_ExcludesThoseRoles() {
        List<Role> roles = roleService.getAllRolesWithout("ROLE_ADMIN", "ROLE_USER");
        assertFalse(roles.contains(new Role("ROLE_ADMIN", RoleType.SYSTEM)));
        assertFalse(roles.contains(new Role("ROLE_USER", RoleType.SYSTEM)));
        assertTrue(roles.contains(new Role("ROLE_GUEST", RoleType.SYSTEM)));
    }

    @Test
    void getAllRolesWithout_NonExistingRoles_ReturnsAllRoles() {
        List<Role> allRoles = Arrays.asList(new Role("ROLE_ADMIN", RoleType.SYSTEM), new Role("ROLE_USER", RoleType.SYSTEM), new Role("ROLE_GUEST", RoleType.SYSTEM));
        List<Role> roles = roleService.getAllRolesWithout("ROLE_FAKE1", "ROLE_FAKE2");
        assertEquals(allRoles, roles);
    }
}
