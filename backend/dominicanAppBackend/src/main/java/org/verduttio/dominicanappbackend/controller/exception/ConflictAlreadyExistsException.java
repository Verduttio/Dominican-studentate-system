package org.verduttio.dominicanappbackend.controller.exception;

public class ConflictAlreadyExistsException extends RuntimeException{
    public ConflictAlreadyExistsException(String message) {
        super(message);
    }
}
