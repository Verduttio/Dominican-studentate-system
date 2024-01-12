package org.verduttio.dominicanappbackend.unittest.validation;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.validation.ScheduleValidator;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

class ScheduleValidatorTest {
    @InjectMocks
    private ScheduleValidator scheduleValidator;

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
        Role commonRole = new Role("A");
        userRoles.add(commonRole);
        allowedRoles.add(commonRole);

        when(mockUser.getRoles()).thenReturn(userRoles);
        when(mockTask.getAllowedRoles()).thenReturn(allowedRoles);

        // Act
        boolean result = scheduleValidator.userHasAllowedRoleForTask(mockUser, mockTask);

        // Assert
        assertTrue(result);
    }

    @Test
    void hasAllowedRoleForTask_shouldReturnFalseWhenUserDoesNotHaveAllowedRole() {
        // Arrange
        MockitoAnnotations.openMocks(this);
        Set<Role> userRoles = new HashSet<>();
        Set<Role> allowedRoles = new HashSet<>();
        Role userRole = new Role("A");
        Role allowedRole = new Role("B");
        userRoles.add(userRole);
        allowedRoles.add(allowedRole);

        when(mockUser.getRoles()).thenReturn(userRoles);
        when(mockTask.getAllowedRoles()).thenReturn(allowedRoles);

        // Act
        boolean result = scheduleValidator.userHasAllowedRoleForTask(mockUser, mockTask);

        // Assert
        assertFalse(result);
    }

    @Test
    void hasAllowedRoleForTask_shouldReturnFalseWhenUserHasNoCommonRoleWithAllowedRoles() {
        // Arrange
        MockitoAnnotations.openMocks(this);
        Set<Role> userRoles = new HashSet<>();
        Set<Role> allowedRoles = new HashSet<>();
        Role roleA = new Role("A");
        Role roleB = new Role("B");
        Role roleC = new Role("C");
        Role roleD = new Role("D");
        userRoles.add(roleA);
        userRoles.add(roleB);
        allowedRoles.add(roleC);
        allowedRoles.add(roleD);

        when(mockUser.getRoles()).thenReturn(userRoles);
        when(mockTask.getAllowedRoles()).thenReturn(allowedRoles);

        // Act
        boolean result = scheduleValidator.userHasAllowedRoleForTask(mockUser, mockTask);

        // Assert
        assertFalse(result);
    }

    @Test
    void hasAllowedRoleForTask_shouldReturnTrueWhenUserHasCommonRoleWithAllowedRoles() {
        // Arrange
        MockitoAnnotations.openMocks(this);
        Set<Role> userRoles = new HashSet<>();
        Set<Role> allowedRoles = new HashSet<>();
        Role roleA = new Role("A");
        Role roleB = new Role("B");
        Role roleC = new Role("C");
        userRoles.add(roleA);
        userRoles.add(roleB);
        allowedRoles.add(roleB);
        allowedRoles.add(roleC);

        when(mockUser.getRoles()).thenReturn(userRoles);
        when(mockTask.getAllowedRoles()).thenReturn(allowedRoles);

        // Act
        boolean result = scheduleValidator.userHasAllowedRoleForTask(mockUser, mockTask);

        // Assert
        assertTrue(result);
    }
}
