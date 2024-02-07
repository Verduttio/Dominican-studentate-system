package org.verduttio.dominicanappbackend.service.exception;

public class UserAlreadyVerifiedException extends RuntimeException {
    public UserAlreadyVerifiedException(String message) {
        super(message);
    }

    public UserAlreadyVerifiedException(String message, Throwable cause) {
        super(message, cause);
    }
}
