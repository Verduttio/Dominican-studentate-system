package org.verduttio.dominicanappbackend.service.exception;

public class ObstacleNotFoundException extends RuntimeException{
    public ObstacleNotFoundException(String message) {
        super(message);
    }
}
