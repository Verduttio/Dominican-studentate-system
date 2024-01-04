package org.verduttio.dominicanappbackend.controller.exception;

public class ConflictIdNotFoundException extends RuntimeException {
    public ConflictIdNotFoundException(String message) {
        super(message);
    }
}
