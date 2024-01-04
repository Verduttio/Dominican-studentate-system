package org.verduttio.dominicanappbackend.service.exception;

public class ConflictIdNotFoundException extends RuntimeException {
    public ConflictIdNotFoundException(String message) {
        super(message);
    }
}
