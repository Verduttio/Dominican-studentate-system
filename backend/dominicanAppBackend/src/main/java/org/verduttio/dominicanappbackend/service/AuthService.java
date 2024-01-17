package org.verduttio.dominicanappbackend.service;

import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.UserDTO;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.security.UserDetailsServiceImpl;
import org.verduttio.dominicanappbackend.validation.UserValidator;

import java.util.Set;

@Service
public class AuthService {
    private final UserValidator userValidator;

    private final RoleService roleService;
    private final UserDetailsServiceImpl userDetailsService;

    public AuthService(UserValidator userValidator, RoleService roleService, UserDetailsServiceImpl userDetailsService) {
        this.userValidator = userValidator;
        this.roleService = roleService;
        this.userDetailsService = userDetailsService;
    }

    public User register(UserDTO userDTO) {
        userValidator.validateEmailWhenRegister(userDTO.getEmail());
        User user = convertUserDTOToUser(userDTO);
        return userDetailsService.signUpUser(user);
    }

    private User convertUserDTOToUser(UserDTO userDTO) {
        User user = userDTO.basicFieldsToUser();
        Set<Role> rolesDB = roleService.getRolesByRoleNames(userDTO.getRoleNames());
        user.setRoles(rolesDB);

        return user;
    }
}
