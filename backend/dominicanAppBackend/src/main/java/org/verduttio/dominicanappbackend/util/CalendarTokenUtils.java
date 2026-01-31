package org.verduttio.dominicanappbackend.util;

import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class CalendarTokenUtils {

    // WAŻNE: To jest Twój tajny klucz. Musi mieć 16, 24 lub 32 znaki.
    // Jeśli go zmienisz, wszystkim przestaną działać kalendarze!
    private static final String SECRET_KEY = "DominicanAppSecretKey12!"; // 24 znaki
    private static final String ALGORITHM = "AES";

    public String encryptUserId(Long userId) {
        try {
            String valueToEncrypt = String.valueOf(userId);
            SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);

            byte[] encryptedBytes = cipher.doFinal(valueToEncrypt.getBytes());
            // Używamy URL Encoder, żeby nie było znaków specjalnych jak '/' czy '+'
            return Base64.getUrlEncoder().withoutPadding().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting calendar token", e);
        }
    }

    public Long decryptUserId(String token) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);

            byte[] decodedBytes = Base64.getUrlDecoder().decode(token);
            byte[] decryptedBytes = cipher.doFinal(decodedBytes);

            String userIdStr = new String(decryptedBytes);
            return Long.parseLong(userIdStr);
        } catch (Exception e) {
            throw new RuntimeException("Invalid calendar token"); // Np. ktoś majstrował przy linku
        }
    }
}