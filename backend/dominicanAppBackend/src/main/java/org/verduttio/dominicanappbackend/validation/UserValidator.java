package org.verduttio.dominicanappbackend.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.repository.UserRepository;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;

import java.util.Optional;

@Component
public class UserValidator {

    private final UserRepository userRepository;

    @Autowired
    public UserValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void validateEmailWhenRegister(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new EntityAlreadyExistsException("User with given email already exists");
        }
    }

    public void validateEmailWhenUpdate(String newEmail, String currentEmail) {
        if(userRepository.existsByEmail(newEmail) && !newEmail.equals(currentEmail)) {
            throw new EntityAlreadyExistsException("This email belongs to another user");
        }
    }

    public User validateOptionalUserIsNotEmpty(Optional<User> user) {
        if (user.isEmpty()) {
            throw new EntityNotFoundException("User not found");
        } else {
            return user.get();
        }
    }

}
