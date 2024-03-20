package org.verduttio.dominicanappbackend.service.exception;

public class SensitiveEntityException extends RuntimeException {
    public SensitiveEntityException(String message) {
        super(message);
    }
}
