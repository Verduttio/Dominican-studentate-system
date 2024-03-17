package org.verduttio.dominicanappbackend.util;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class EnvUtils {
    private final Environment env;

    public EnvUtils(Environment env) {
        this.env = env;
    }

    public String getAppEnvVariable(String variableName) {
        return env.getProperty(variableName);
    }
}
