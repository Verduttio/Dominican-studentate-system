package org.verduttio.dominicanappbackend.service.exception;

import org.springframework.security.core.AuthenticationException;

public class ApiAuthAuthenticationProcessingException extends AuthenticationException {
    public ApiAuthAuthenticationProcessingException(String msg, Throwable t) {
        super(msg, t);
    }

    public ApiAuthAuthenticationProcessingException(String msg) {
        super(msg);
    }
}
