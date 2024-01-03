package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.UserDTO;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;

    @Autowired
    public UserService(UserRepository userRepository, RoleService roleService) {
        this.userRepository = userRepository;
        this.roleService = roleService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public void saveUser(UserDTO userDTO) {
        User user = convertUserDTOToUser(userDTO);
        userRepository.save(user);
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    private User convertUserDTOToUser(UserDTO userDTO) {
        User user = userDTO.basicFieldsToUser();
        Set<Role> rolesDB = roleService.getRolesByRoleNames(userDTO.getRoleNames());
        user.setRoles(rolesDB);

        return user;
    }

    public void updateUser(User existingUser, UserDTO updatedUserDTO) {
        existingUser.setEmail(updatedUserDTO.getEmail());
        existingUser.setPassword(updatedUserDTO.getPassword());
        Set<Role> rolesDB = roleService.getRolesByRoleNames(updatedUserDTO.getRoleNames());
        existingUser.setRoles(rolesDB);

        userRepository.save(existingUser);
    }
}
