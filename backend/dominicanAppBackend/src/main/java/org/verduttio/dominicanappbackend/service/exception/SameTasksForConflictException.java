package org.verduttio.dominicanappbackend.service.exception;

public class SameTasksForConflictException extends RuntimeException{
    public SameTasksForConflictException(String message) {
        super(message);
    }
}
