package org.verduttio.dominicanappbackend.service.exception;

public class RoleExistsByNameException extends RuntimeException{
    public RoleExistsByNameException(String message) {
        super(message);
    }
}
