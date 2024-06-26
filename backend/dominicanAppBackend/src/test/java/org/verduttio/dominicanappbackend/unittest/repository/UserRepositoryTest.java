package org.verduttio.dominicanappbackend.unittest.repository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.verduttio.dominicanappbackend.dto.user.UserShortInfo;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.UserRepository;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@DataJpaTest
@ExtendWith(SpringExtension.class)
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("integration_tests")
public class UserRepositoryTest {

    @Mock
    private UserRepository userRepository;

    @Test
    public void testFindByEmail() {
        String email = "test@example.com";
        User expectedUser = new User();
        expectedUser.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(expectedUser));

        Optional<User> actualUser = userRepository.findByEmail(email);

        assertThat(actualUser).isPresent().contains(expectedUser);
    }

    @Test
    public void testExistsByEmail() {
        String email = "test@example.com";

        when(userRepository.existsByEmail(email)).thenReturn(true);

        boolean exists = userRepository.existsByEmail(email);

        assertThat(exists).isTrue();
    }

    @Test
    public void testExistsById() {
        Long userId = 1L;

        when(userRepository.existsById(userId)).thenReturn(true);

        boolean exists = userRepository.existsById(userId);

        assertThat(exists).isTrue();
    }

    @Test
    public void testFindAllUsersShortInfo() {
        UserShortInfo userShortInfo1 = new UserShortInfo(1L, "John", "Doe");
        UserShortInfo userShortInfo2 = new UserShortInfo(2L, "Jane", "Smith");

        List<UserShortInfo> expectedUserShortInfos = Arrays.asList(userShortInfo1, userShortInfo2);
        when(userRepository.findAllUsersShortInfo()).thenReturn(expectedUserShortInfos);

        List<UserShortInfo> actualUserShortInfos = userRepository.findAllUsersShortInfo();

        assertThat(actualUserShortInfos).isEqualTo(expectedUserShortInfos);
    }

    @Test
    public void testRemoveRoleFromAllUsers() {
        Long roleId = 1L;

        doNothing().when(userRepository).removeRoleFromAllUsers(roleId);

        userRepository.removeRoleFromAllUsers(roleId);

        verify(userRepository, times(1)).removeRoleFromAllUsers(roleId);
    }

    @Test
    public void testFindAllWhichHaveAnyOfRoles() {
        List<String> roleNames = Arrays.asList("ROLE_ADMIN", "ROLE_USER");
        User user1 = new User();
        User user2 = new User();

        List<User> expectedUsers = Arrays.asList(user1, user2);
        when(userRepository.findAllWhichHaveAnyOfRoles(roleNames)).thenReturn(expectedUsers);

        List<User> actualUsers = userRepository.findAllWhichHaveAnyOfRoles(roleNames);

        assertThat(actualUsers).isEqualTo(expectedUsers);
    }

    @Test
    public void testCountByNotEnabled() {
        Long expectedCount = 5L;

        when(userRepository.countByNotEnabled()).thenReturn(expectedCount);

        Long actualCount = userRepository.countByNotEnabled();

        assertThat(actualCount).isEqualTo(expectedCount);
    }

    @Test
    public void testFindByEmailWithNonExistingEmail() {
        String email = "nonexisting@example.com";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        Optional<User> actualUser = userRepository.findByEmail(email);

        assertThat(actualUser).isNotPresent();
    }

    @Test
    public void testExistsByEmailWithNonExistingEmail() {
        String email = "nonexisting@example.com";

        when(userRepository.existsByEmail(email)).thenReturn(false);

        boolean exists = userRepository.existsByEmail(email);

        assertThat(exists).isFalse();
    }

    @Test
    public void testExistsByIdWithNonExistingId() {
        Long userId = 999L;

        when(userRepository.existsById(userId)).thenReturn(false);

        boolean exists = userRepository.existsById(userId);

        assertThat(exists).isFalse();
    }

    @Test
    public void testFindAllUsersShortInfoWithEmptyResult() {
        when(userRepository.findAllUsersShortInfo()).thenReturn(Collections.emptyList());

        List<UserShortInfo> actualUserShortInfos = userRepository.findAllUsersShortInfo();

        assertThat(actualUserShortInfos).isEmpty();
    }

    @Test
    public void testFindAllWhichHaveAnyOfRolesWithEmptyResult() {
        List<String> roleNames = List.of("ROLE_NONEXISTENT");

        when(userRepository.findAllWhichHaveAnyOfRoles(roleNames)).thenReturn(Collections.emptyList());

        List<User> actualUsers = userRepository.findAllWhichHaveAnyOfRoles(roleNames);

        assertThat(actualUsers).isEmpty();
    }

    @Test
    public void testRemoveRoleFromAllUsersWithNonExistingRole() {
        Long roleId = 999L;

        doNothing().when(userRepository).removeRoleFromAllUsers(roleId);

        userRepository.removeRoleFromAllUsers(roleId);

        verify(userRepository, times(1)).removeRoleFromAllUsers(roleId);
    }

    @Test
    public void testCountByNotEnabledWithZeroResult() {
        Long expectedCount = 0L;

        when(userRepository.countByNotEnabled()).thenReturn(expectedCount);

        Long actualCount = userRepository.countByNotEnabled();

        assertThat(actualCount).isEqualTo(expectedCount);
    }
}