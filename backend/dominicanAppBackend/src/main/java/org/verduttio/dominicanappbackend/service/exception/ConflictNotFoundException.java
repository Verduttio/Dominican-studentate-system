package org.verduttio.dominicanappbackend.service.exception;

public class ConflictNotFoundException extends RuntimeException {
    public ConflictNotFoundException(String message) {
        super(message);
    }
}
