package org.verduttio.dominicanappbackend.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.session.Session;
import org.springframework.session.security.SpringSessionBackedSessionRegistry;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.LoginRequest;
import org.verduttio.dominicanappbackend.dto.RegisterUserRequest;
import org.verduttio.dominicanappbackend.dto.UserDTO;
import org.verduttio.dominicanappbackend.entity.AuthProvider;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.entity.UserShortInfo;
import org.verduttio.dominicanappbackend.security.UserDetailsImpl;
import org.verduttio.dominicanappbackend.service.UserService;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final SpringSessionBackedSessionRegistry<? extends Session>  sessionRegistry;

    @Autowired
    public UserController(UserService userService, SpringSessionBackedSessionRegistry<? extends Session> sessionRegistry) {
        this.userService = userService;
        this.sessionRegistry = sessionRegistry;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterUserRequest registerUserRequest) {
        User user;
        try{
            user = userService.register(registerUserRequest, AuthProvider.LOCAL);
        } catch (EntityAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return new ResponseEntity<>("User registered successfully: " + user.getEmail(), HttpStatus.OK);
    }

    @PostMapping("/register-dev")
    public ResponseEntity<?> registerDev(@Valid @RequestBody UserDTO userDTO) {
        User user;
        try{
            user = userService.registerDev(userDTO, AuthProvider.LOCAL);
        } catch (EntityAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return new ResponseEntity<>("User registered successfully: " + user.getEmail(), HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) throws ServletException {
        return ResponseEntity.ok("User authenticated successfully");
    }

    @GetMapping("/activeSessions")
    public ResponseEntity<?> getActiveSessions() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<SessionInformation> principals = sessionRegistry.getAllSessions(principal, false);

        for (SessionInformation p : principals) {
            System.out.println("Principal: " + p.getPrincipal() + " Session ID: " + p.getSessionId());
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) principal;

        return ResponseEntity.ok("Active sessions for user: " + userDetails.getUsername() + " are: " + principals.size());
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return new ResponseEntity<>(userDetails.getUser(), HttpStatus.OK);
    }

    @GetMapping("/current/check")
    public ResponseEntity<?> checkIfUserIsLoggedIn() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            return new ResponseEntity<>("User is logged in", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("No user logged in", HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/shortInfo")
    public ResponseEntity<List<UserShortInfo>> getAllUsersShortInfo() {
        List<UserShortInfo> users = userService.getAllUsersShortInfo();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        return userService.getUserById(userId)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserDTO userDTO) {
        try {
            userService.createUser(userDTO);
        } catch (EntityAlreadyExistsException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @Valid @RequestBody UserDTO updatedUserDTO) {
        try {
            userService.updateUser(userId, updatedUserDTO);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (EntityAlreadyExistsException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
