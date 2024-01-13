package org.verduttio.dominicanappbackend.service.exception;

public class ScheduleIsInConflictException extends RuntimeException {
    public ScheduleIsInConflictException(String message) {
        super(message);
    }
}
