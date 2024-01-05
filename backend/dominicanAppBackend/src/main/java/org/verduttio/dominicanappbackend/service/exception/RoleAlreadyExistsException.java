package org.verduttio.dominicanappbackend.service.exception;

public class RoleAlreadyExistsException extends RuntimeException{
    public RoleAlreadyExistsException(String message) {
        super(message);
    }
}
