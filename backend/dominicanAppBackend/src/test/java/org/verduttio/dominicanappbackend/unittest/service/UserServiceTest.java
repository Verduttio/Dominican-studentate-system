package org.verduttio.dominicanappbackend.unittest.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.verduttio.dominicanappbackend.dto.user.UserDTO;
import org.verduttio.dominicanappbackend.dto.user.UserNameSurnameDTO;
import org.verduttio.dominicanappbackend.dto.user.UserShortInfo;
import org.verduttio.dominicanappbackend.domain.AuthProvider;
import org.verduttio.dominicanappbackend.domain.Role;
import org.verduttio.dominicanappbackend.domain.RoleType;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.UserRepository;
import org.verduttio.dominicanappbackend.security.SecurityUtils;
import org.verduttio.dominicanappbackend.security.UserDetailsServiceImpl;
import org.verduttio.dominicanappbackend.security.UserSessionService;
import org.verduttio.dominicanappbackend.service.RoleService;
import org.verduttio.dominicanappbackend.service.UserService;
import org.verduttio.dominicanappbackend.validation.UserValidator;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("integration_tests")
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleService roleService;

    @Mock
    private UserValidator userValidator;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private ObstacleRepository obstacleRepository;

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Mock
    private UserSessionService userSessionService;

    @InjectMocks
    private UserService userService;

    @Test
    public void testGetAllUsers() {
        User user1 = new User();
        User user2 = new User();

        List<User> expectedUsers = Arrays.asList(user1, user2);
        when(userRepository.findAll(Sort.by(Sort.Direction.ASC, "isEnabled"))).thenReturn(expectedUsers);

        List<User> actualUsers = userService.getAllUsers();

        assertThat(actualUsers).isEqualTo(expectedUsers);
    }

    @Test
    public void testGetUserById() {
        Long userId = 1L;
        User expectedUser = new User();
        expectedUser.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(expectedUser));

        Optional<User> actualUser = userService.getUserById(userId);

        assertThat(actualUser).isPresent().contains(expectedUser);
    }

    @Test
    public void testGetAllUsersShortInfo() {
        UserShortInfo userShortInfo1 = new UserShortInfo(1L, "John", "Doe");
        UserShortInfo userShortInfo2 = new UserShortInfo(2L, "Jane", "Smith");

        List<UserShortInfo> expectedUserShortInfos = Arrays.asList(userShortInfo1, userShortInfo2);
        when(userRepository.findAllUsersShortInfo()).thenReturn(expectedUserShortInfos);

        List<UserShortInfo> actualUserShortInfos = userService.getAllUsersShortInfo();

        assertThat(actualUserShortInfos).isEqualTo(expectedUserShortInfos);
    }

    @Test
    public void testGetUsersWhichHaveAnyOfRoles() {
        List<String> roleNames = Arrays.asList("ROLE_ADMIN", "ROLE_USER");
        User user1 = new User();
        User user2 = new User();

        List<User> expectedUsers = Arrays.asList(user1, user2);
        when(userRepository.findAllWhichHaveAnyOfRoles(roleNames)).thenReturn(expectedUsers);

        List<User> actualUsers = userService.getUsersWhichHaveAnyOfRoles(roleNames);

        assertThat(actualUsers).isEqualTo(expectedUsers);
    }

    @Test
    public void testCreateUser() {
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail("test@example.com");
        User user = new User();

        doNothing().when(userValidator).validateEmailWhenRegister(userDTO.getEmail());
        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.createUser(userDTO);

        verify(userValidator, times(1)).validateEmailWhenRegister(userDTO.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    public void testSaveUser() {
        User user = new User();

        when(userRepository.save(user)).thenReturn(user);

        userService.saveUser(user);

        verify(userRepository, times(1)).save(user);
    }

    @Test
    public void testDeleteUser() {
        Long userId = 1L;

        when(userRepository.existsById(userId)).thenReturn(true);
        doNothing().when(obstacleRepository).deleteAllByApplicantUserId(userId);
        doNothing().when(obstacleRepository).updateAllByRecipientUserIdToNull(userId);
        doNothing().when(scheduleRepository).deleteAllByUserId(userId);
        doNothing().when(userRepository).deleteById(userId);

        userService.deleteUser(userId);

        verify(obstacleRepository, times(1)).deleteAllByApplicantUserId(userId);
        verify(obstacleRepository, times(1)).updateAllByRecipientUserIdToNull(userId);
        verify(scheduleRepository, times(1)).deleteAllByUserId(userId);
        verify(userRepository, times(1)).deleteById(userId);
    }

    @Test
    public void testGetUserByEmail() {
        String email = "test@example.com";
        User expectedUser = new User();
        expectedUser.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(expectedUser));

        Optional<User> actualUser = userService.getUserByEmail(email);

        assertThat(actualUser).isPresent().contains(expectedUser);
    }

    @Test
    public void testExistsByEmail() {
        String email = "test@example.com";

        when(userRepository.existsByEmail(email)).thenReturn(true);

        boolean exists = userService.existsByEmail(email);

        assertThat(exists).isTrue();
    }

    @Test
    public void testExistsById() {
        Long userId = 1L;

        when(userRepository.existsById(userId)).thenReturn(true);

        boolean exists = userService.existsById(userId);

        assertThat(exists).isTrue();
    }

    @Test
    public void testRegisterDev() {
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail("test@example.com");
        User user = new User();

        doNothing().when(userValidator).validateEmailWhenRegister(userDTO.getEmail());
        when(userDetailsService.signUpUser(any(User.class))).thenReturn(user);

        User actualUser = userService.registerDev(userDTO, AuthProvider.LOCAL);

        assertThat(actualUser).isEqualTo(user);
    }

    @Test
    public void testUpdateUser() {
        Long userId = 1L;
        UserDTO updatedUserDTO = new UserDTO();
        updatedUserDTO.setEmail("updated@example.com");
        updatedUserDTO.setName("Updated");
        updatedUserDTO.setSurname("User");
        User existingUser = new User();
        existingUser.setEmail("current@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userValidator.validateOptionalUserIsNotEmpty(Optional.of(existingUser))).thenReturn(existingUser);
        doNothing().when(userValidator).validateEmailWhenUpdate(updatedUserDTO.getEmail(), existingUser.getEmail());
        when(userRepository.save(existingUser)).thenReturn(existingUser);

        userService.updateUser(userId, updatedUserDTO);

        verify(userRepository, times(1)).save(existingUser);
    }


    @Test
    public void testUpdateUserRolesSupervisorAndTaskPerformer() {
        Long userId = 1L;
        Set<String> roleNames = new HashSet<>(Arrays.asList("ROLE_USER", "ROLE_SUPERVISOR"));
        User user = new User();

        Role roleUser = new Role();
        roleUser.setName("ROLE_USER");
        roleUser.setType(RoleType.SYSTEM);

        Role roleSupervisor = new Role();
        roleSupervisor.setName("ROLE_SUPERVISOR");
        roleSupervisor.setType(RoleType.SUPERVISOR);

        Role roleFunkcyjny = new Role();
        roleFunkcyjny.setName("ROLE_FUNKCYJNY");
        roleFunkcyjny.setType(RoleType.SUPERVISOR);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(roleService.getRolesByRoleNames(anySet())).thenReturn(new HashSet<>(Arrays.asList(roleUser, roleSupervisor)));
        when(roleService.getRoleByName("ROLE_FUNKCYJNY")).thenReturn(roleFunkcyjny);
        when(userRepository.save(user)).thenReturn(user);

        userService.updateUserRolesSupervisorAndTaskPerformer(userId, roleNames);

        verify(userSessionService, times(1)).expireUserSessions(user.getEmail());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    public void testUpdateUserPassword() {
        Long userId = 1L;
        String newPassword = "newPassword";
        User user = new User();
        user.setId(userId);
        user.setEmail("test@example.com");

        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(() -> SecurityUtils.isUserOwnerOrAdmin(userId)).thenReturn(true);
            mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(user);

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(bCryptPasswordEncoder.encode(newPassword)).thenReturn("encodedPassword");
            when(userRepository.save(user)).thenReturn(user);

            userService.updateUserPassword(userId, newPassword);

            assertThat(user.getPassword()).isEqualTo("encodedPassword");
            verify(userRepository, times(1)).save(user);
        }
    }

    @Test
    public void testUpdateUserNameSurnameFields() {
        Long userId = 1L;
        UserNameSurnameDTO userNameSurnameDTO = new UserNameSurnameDTO();
        userNameSurnameDTO.setName("NewName");
        userNameSurnameDTO.setSurname("NewSurname");
        User user = new User();
        user.setEmail("test@example.com");

        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(() -> SecurityUtils.isUserOwnerOrAdmin(userId)).thenReturn(true);
            mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(user);
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(userRepository.save(user)).thenReturn(user);

            userService.updateUserNameSurnameFields(userId, userNameSurnameDTO);

            assertThat(user.getName()).isEqualTo("NewName");
            assertThat(user.getSurname()).isEqualTo("NewSurname");
            verify(userSessionService, times(1)).expireUserSessions(user.getEmail());
        }
    }

    @Test
    public void testGetNumberOfNotVerifiedUsers() {
        Long expectedCount = 5L;

        when(userRepository.countByNotEnabled()).thenReturn(expectedCount);

        Long actualCount = userService.getNumberOfNotVerifiedUsers();

        assertThat(actualCount).isEqualTo(expectedCount);
    }
}