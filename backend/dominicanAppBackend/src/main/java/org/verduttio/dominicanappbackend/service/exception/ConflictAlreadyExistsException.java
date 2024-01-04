package org.verduttio.dominicanappbackend.service.exception;

public class ConflictAlreadyExistsException extends RuntimeException{
    public ConflictAlreadyExistsException(String message) {
        super(message);
    }
}
