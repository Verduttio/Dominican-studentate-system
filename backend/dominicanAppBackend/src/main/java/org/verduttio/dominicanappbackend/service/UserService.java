package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.UserRepository;

import java.util.HashSet;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public Set<Role> getUserRoles(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        return (user != null) ? user.getRoles() : new HashSet<>();
    }

    public void assignRoles(Long userId, Set<Role> roles) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setRoles(roles);
            userRepository.save(user);
        }
    }

    public void removeRoles(Long userId, Set<Role> roles) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.getRoles().removeAll(roles);
            userRepository.save(user);
        }
    }

}
