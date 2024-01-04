package org.verduttio.dominicanappbackend.service.exception;

public class UserWithGivenEmailAlreadyExistsException extends RuntimeException{
    public UserWithGivenEmailAlreadyExistsException(String message) {
        super(message);
    }
}
