package org.verduttio.dominicanappbackend.util;

import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class CalendarTokenUtils {

    private final String secretKey;
    private static final String ALGORITHM = "AES";

    public CalendarTokenUtils(EnvUtils envUtils) {
        this.secretKey = envUtils.getAppEnvVariable("WISHES_GAS_SECRET");
    }

    public String encryptUserId(Long userId) {
        try {
            String valueToEncrypt = String.valueOf(userId);
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8),
                    ALGORITHM
            );

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);

            byte[] encryptedBytes = cipher.doFinal(
                    valueToEncrypt.getBytes(StandardCharsets.UTF_8)
            );

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(encryptedBytes);

        } catch (Exception e) {
            throw new RuntimeException("Error encrypting calendar token", e);
        }
    }

    public Long decryptUserId(String token) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8),
                    ALGORITHM
            );

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);

            byte[] decodedBytes = Base64.getUrlDecoder().decode(token);
            byte[] decryptedBytes = cipher.doFinal(decodedBytes);

            String userIdStr = new String(
                    decryptedBytes,
                    StandardCharsets.UTF_8
            );

            return Long.parseLong(userIdStr);

        } catch (Exception e) {
            throw new RuntimeException("Invalid calendar token");
        }
    }
}