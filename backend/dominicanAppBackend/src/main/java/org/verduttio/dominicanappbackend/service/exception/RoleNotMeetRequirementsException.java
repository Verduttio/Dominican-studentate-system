package org.verduttio.dominicanappbackend.service.exception;

public class RoleNotMeetRequirementsException extends RuntimeException {
    public RoleNotMeetRequirementsException(String message) {
        super(message);
    }
}
