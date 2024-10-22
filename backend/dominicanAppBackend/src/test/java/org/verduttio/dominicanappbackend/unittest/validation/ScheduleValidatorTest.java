package org.verduttio.dominicanappbackend.unittest.validation;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.domain.RoleType;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.service.ScheduleService;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

class ScheduleValidatorTest {
    @InjectMocks
    private ScheduleService scheduleService;

    @Mock
    private User mockUser;

    @Mock
    private Task mockTask;

    @Test
    void hasAllowedRoleForTask_shouldReturnTrueWhenUserHasAllowedRole() {
        // Arrange
        MockitoAnnotations.openMocks(this);
        Set<Role> userRoles = new HashSet<>();
        Set<Role> allowedRoles = new HashSet<>();
        Role commonRole = new Role("A", RoleType.SYSTEM);
        userRoles.add(commonRole);
        allowedRoles.add(commonRole);

        when(mockUser.getRoles()).thenReturn(userRoles);
        when(mockTask.getAllowedRoles()).thenReturn(allowedRoles);

        // Act
        boolean result = scheduleService.userHasAllowedRoleForTask(mockUser, mockTask);

        // Assert
        assertTrue(result);
    }

    @Test
    void hasAllowedRoleForTask_shouldReturnFalseWhenUserDoesNotHaveAllowedRole() {
        // Arrange
        MockitoAnnotations.openMocks(this);
        Set<Role> userRoles = new HashSet<>();
        Set<Role> allowedRoles = new HashSet<>();
        Role userRole = new Role("A", RoleType.SYSTEM);
        Role allowedRole = new Role("B", RoleType.SYSTEM);
        userRoles.add(userRole);
        allowedRoles.add(allowedRole);

        when(mockUser.getRoles()).thenReturn(userRoles);
        when(mockTask.getAllowedRoles()).thenReturn(allowedRoles);

        // Act
        boolean result = scheduleService.userHasAllowedRoleForTask(mockUser, mockTask);

        // Assert
        assertFalse(result);
    }

    @Test
    void hasAllowedRoleForTask_shouldReturnFalseWhenUserHasNoCommonRoleWithAllowedRoles() {
        // Arrange
        MockitoAnnotations.openMocks(this);
        Set<Role> userRoles = new HashSet<>();
        Set<Role> allowedRoles = new HashSet<>();
        Role roleA = new Role("A", RoleType.SYSTEM);
        Role roleB = new Role("B", RoleType.SYSTEM);
        Role roleC = new Role("C", RoleType.SYSTEM);
        Role roleD = new Role("D", RoleType.SYSTEM);
        userRoles.add(roleA);
        userRoles.add(roleB);
        allowedRoles.add(roleC);
        allowedRoles.add(roleD);

        when(mockUser.getRoles()).thenReturn(userRoles);
        when(mockTask.getAllowedRoles()).thenReturn(allowedRoles);

        // Act
        boolean result = scheduleService.userHasAllowedRoleForTask(mockUser, mockTask);

        // Assert
        assertFalse(result);
    }

    @Test
    void hasAllowedRoleForTask_shouldReturnTrueWhenUserHasCommonRoleWithAllowedRoles() {
        // Arrange
        MockitoAnnotations.openMocks(this);
        Set<Role> userRoles = new HashSet<>();
        Set<Role> allowedRoles = new HashSet<>();
        Role roleA = new Role("A", RoleType.SYSTEM);
        Role roleB = new Role("B", RoleType.SYSTEM);
        Role roleC = new Role("C", RoleType.SYSTEM);
        userRoles.add(roleA);
        userRoles.add(roleB);
        allowedRoles.add(roleB);
        allowedRoles.add(roleC);

        when(mockUser.getRoles()).thenReturn(userRoles);
        when(mockTask.getAllowedRoles()).thenReturn(allowedRoles);

        // Act
        boolean result = scheduleService.userHasAllowedRoleForTask(mockUser, mockTask);

        // Assert
        assertTrue(result);
    }
}
