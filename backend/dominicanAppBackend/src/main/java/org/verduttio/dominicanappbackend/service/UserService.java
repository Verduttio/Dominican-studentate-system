package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.RegisterUserRequest;
import org.verduttio.dominicanappbackend.dto.UserDTO;
import org.verduttio.dominicanappbackend.entity.AuthProvider;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.entity.UserShortInfo;
import org.verduttio.dominicanappbackend.repository.UserRepository;
import org.verduttio.dominicanappbackend.security.UserDetailsServiceImpl;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.validation.UserValidator;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final UserValidator userValidator;
    private final UserDetailsServiceImpl userDetailsService;

    @Autowired
    public UserService(UserRepository userRepository, RoleService roleService,
                       UserValidator userValidator, UserDetailsServiceImpl userDetailsService) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.userValidator = userValidator;
        this.userDetailsService = userDetailsService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public List<UserShortInfo> getAllUsersShortInfo() {
        return userRepository.findAllUsersShortInfo();
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
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User with given id does not exist");
        }
        userRepository.deleteById(userId);
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

    protected boolean existsAnotherUserWithGivenEmail(String newEmail, String currentEmail) {
        return userRepository.existsByEmail(newEmail) && !newEmail.equals(currentEmail);
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
        List<Role> roles = roleService.getAllRolesWithout("ROLE_ADMIN");  // and other sensitive roles!  //TODO: make a variable in application properties for this???
        user.setRoles(new HashSet<>(roles));
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
}
