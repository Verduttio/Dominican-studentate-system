package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.verduttio.dominicanappbackend.domain.*;
import org.verduttio.dominicanappbackend.dto.auth.RegisterUserRequest;
import org.verduttio.dominicanappbackend.dto.user.UserDTO;
import org.verduttio.dominicanappbackend.dto.user.UserNameSurnameDTO;
import org.verduttio.dominicanappbackend.dto.user.UserShortInfo;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;
import org.verduttio.dominicanappbackend.repository.UserRepository;
import org.verduttio.dominicanappbackend.security.SecurityUtils;
import org.verduttio.dominicanappbackend.security.UserDetailsServiceImpl;
import org.verduttio.dominicanappbackend.security.UserSessionService;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.UserAlreadyVerifiedException;
import org.verduttio.dominicanappbackend.validation.UserValidator;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final TaskService taskService;
    private final UserValidator userValidator;
    private final UserDetailsServiceImpl userDetailsService;
    private final ObstacleRepository obstacleRepository;
    private final ScheduleRepository scheduleRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final UserSessionService userSessionService;

    @Autowired
    public UserService(UserRepository userRepository, RoleService roleService, TaskService taskService,
                       UserValidator userValidator, UserDetailsServiceImpl userDetailsService, ObstacleRepository obstacleRepository, ScheduleRepository scheduleRepository, BCryptPasswordEncoder bCryptPasswordEncoder, SessionRegistry sessionRegistry, UserSessionService userSessionService) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.taskService = taskService;
        this.userValidator = userValidator;
        this.userDetailsService = userDetailsService;
        this.obstacleRepository = obstacleRepository;
        this.scheduleRepository = scheduleRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.userSessionService = userSessionService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAllByOrderByEntryDateAsc(Sort.by(Sort.Direction.ASC, "isEnabled"));
    }

    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public List<UserShortInfo> getAllUsersShortInfo() {
        return userRepository.findAllUsersShortInfo();
    }

    public List<User> getUsersWhichHaveAnyOfRoles(List<String> roleNames) {
        return userRepository.findAllWhichHaveAnyOfRoles(roleNames);
    }

    public List<User> getUsersWhichHaveAnyOfRolesIds(List<Long> roleIds) {
        return userRepository.findAllWhichHaveAnyOfRolesIds(roleIds);
    }

    public List<User> getUsersWhichAreEligibleToPerformTasksAssignedToSupervisorRole(Long supervisorRoleId) {
        List<Task> roleTasks = taskService.findTasksBySupervisorRoleId(supervisorRoleId);
        List<Long> eligibleRoles = roleTasks.stream().map(Task::getAllowedRoles).flatMap(Set::stream).collect(Collectors.toSet()).stream().map(Role::getId).collect(Collectors.toList());

        return getUsersWhichHaveAnyOfRolesIds(eligibleRoles);
    }

    public List<User> getUsersWhichAreEligibleToPerformTasksAssignedToSupervisorRole(String supervisorRoleName) {
        List<Task> roleTasks = taskService.findTasksBySupervisorRoleName(supervisorRoleName);
        List<Long> eligibleRoles = roleTasks.stream().map(Task::getAllowedRoles).flatMap(Set::stream).collect(Collectors.toSet()).stream().map(Role::getId).collect(Collectors.toList());

        return getUsersWhichHaveAnyOfRolesIds(eligibleRoles);
    }

    public void createUser(UserDTO userDTO) {
        userValidator.validateEmailWhenRegister(userDTO.getEmail());
        User user = convertUserDTOToUser(userDTO, AuthProvider.LOCAL);
        userRepository.save(user);
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        if (userRepository.existsById(userId)) {
            obstacleRepository.deleteAllByApplicantUserId(userId);
            obstacleRepository.updateAllByRecipientUserIdToNull(userId);
            scheduleRepository.deleteAllByUserId(userId);
            userRepository.deleteById(userId);
        } else {
            throw new EntityNotFoundException("User with given id does not exist");
        }
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }

    public User register(RegisterUserRequest registerUserRequest, AuthProvider authProvider) {
        userValidator.validateEmailWhenRegister(registerUserRequest.getEmail());
        User user = convertRegisterUserRequestToUser(registerUserRequest, authProvider);
        return userDetailsService.signUpUser(user);
    }

    public User registerDev(UserDTO userDTO, AuthProvider authProvider) {
        userValidator.validateEmailWhenRegister(userDTO.getEmail());
        User user = convertUserDTOToUser(userDTO, authProvider);
        return userDetailsService.signUpUser(user);
    }

    private User convertRegisterUserRequestToUser(RegisterUserRequest registerUserRequest, AuthProvider authProvider) {
        User user = new User();
        user.setEmail(registerUserRequest.getEmail());
        user.setPassword(registerUserRequest.getPassword());
        user.setName(registerUserRequest.getName());
        user.setSurname(registerUserRequest.getSurname());
        user.setProvider(authProvider);
        Role roles = roleService.getRoleByName("ROLE_USER");
        user.setRoles(Set.of(roles));
        return user;
    }

    private User convertUserDTOToUser(UserDTO userDTO, AuthProvider authProvider) {
        User user = userDTO.basicFieldsToUser();
        Set<Role> rolesDB = roleService.getRolesByRoleNames(userDTO.getRoleNames());
        user.setRoles(rolesDB);
        user.setProvider(authProvider);

        return user;
    }

    public void updateUser(Long userId, UserDTO updatedUserDTO) {
        Optional<User> user = userRepository.findById(userId);
        User existingUser = userValidator.validateOptionalUserIsNotEmpty(user);
        userValidator.validateEmailWhenUpdate(updatedUserDTO.getEmail(), existingUser.getEmail());

        existingUser.setName(updatedUserDTO.getName());
        existingUser.setSurname(updatedUserDTO.getSurname());
        existingUser.setEmail(updatedUserDTO.getEmail());
        existingUser.setPassword(updatedUserDTO.getPassword());
        Set<Role> rolesDB = roleService.getRolesByRoleNames(updatedUserDTO.getRoleNames());
        existingUser.setRoles(rolesDB);

        userRepository.save(existingUser);
    }

    @Transactional
    public void updateUserRolesSupervisorAndTaskPerformer(Long userId, Set<String> roleNames) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new EntityNotFoundException("User with given id does not exist");
        }
        User existingUser = user.get();

        Set<Role> rolesDB = roleService.getRolesByRoleNames(new HashSet<>(roleNames));

        boolean anySupervisorRole = rolesDB.stream().anyMatch(role -> role.getType().equals(RoleType.SUPERVISOR));
        if(anySupervisorRole) {
            rolesDB.add(roleService.getRoleByName("ROLE_FUNKCYJNY"));
        } else {
            rolesDB.remove(roleService.getRoleByName("ROLE_FUNKCYJNY"));
        }

        existingUser.setRoles(rolesDB);

        userRepository.save(existingUser);
        userSessionService.expireUserSessions(existingUser.getEmail());
    }

    public void assignRolesOnVerificationAndVerifyUser(Long userId, Set<String> roles) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new EntityNotFoundException("User with given id does not exist");
        }
        User existingUser = user.get();

        if (existingUser.isEnabled()) {
            throw new UserAlreadyVerifiedException("User is already verified");
        }

        Set<Role> rolesDB = roleService.getRolesByRoleNames(new HashSet<>(roles));

        // Check if rolesDB contains role with type SUPERVISOR
        boolean supervisorRoleIsIn = rolesDB.stream().anyMatch(role -> role.getType().equals(RoleType.SUPERVISOR));
        if(supervisorRoleIsIn) {
            rolesDB.add(roleService.getRoleByName("ROLE_FUNKCYJNY"));
        }

        Set<Role> userRoles = existingUser.getRoles();
        userRoles.addAll(rolesDB);

        existingUser.setRoles(userRoles);

        // Verify user
        existingUser.setEnabled(true);

        userRepository.save(existingUser);
    }

    public void updateUserPassword(Long userId, String newPassword) {
        if (!SecurityUtils.isUserOwnerOrAdmin(userId)) {
            throw new AccessDeniedException(SecurityUtils.ACCESS_DENIED_MESSAGE);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setPassword(bCryptPasswordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public boolean checkIfUserHasAnyTaskPerformerRole(Long userId) {
        Set<Role> userRoles = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"))
                .getRoles();

        return userRoles.stream().anyMatch(role -> role.getType().equals(RoleType.TASK_PERFORMER));
    }

    @Transactional
    public void updateUserNameSurnameFields(Long userId, UserNameSurnameDTO userNameSurnameDTO) throws EntityNotFoundException{
        if (!SecurityUtils.isUserOwnerOrAdmin(userId)) {
            throw new AccessDeniedException(SecurityUtils.ACCESS_DENIED_MESSAGE);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setName(userNameSurnameDTO.getName());
        user.setSurname(userNameSurnameDTO.getSurname());
        userRepository.save(user);
        userSessionService.expireUserSessions(user.getEmail());
    }

    public Long getNumberOfNotVerifiedUsers() {
        return userRepository.countByNotEnabled();
    }

    public void updateEntryDate(Long userId, LocalDateTime entryDate) {
        if (!SecurityUtils.isUserOwnerOrAdmin(userId)) {
            throw new AccessDeniedException(SecurityUtils.ACCESS_DENIED_MESSAGE);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setEntryDate(entryDate);
        userRepository.save(user);
        userSessionService.expireUserSessions(user.getEmail());
    }
}
