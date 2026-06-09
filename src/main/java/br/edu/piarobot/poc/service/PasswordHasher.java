package br.edu.piarobot.poc.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

public final class PasswordHasher {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final HexFormat HEX = HexFormat.of();

    private PasswordHasher() {
    }

    public static String randomSalt() {
        byte[] bytes = new byte[16];
        RANDOM.nextBytes(bytes);
        return HEX.formatHex(bytes);
    }

    public static String randomTemporaryPassword() {
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        byte[] bytes = new byte[12];
        RANDOM.nextBytes(bytes);
        StringBuilder sb = new StringBuilder(12);
        for (byte b : bytes) {
            sb.append(alphabet.charAt(Byte.toUnsignedInt(b) % alphabet.length()));
        }
        return sb.toString();
    }

    public static String hash(String password, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest((salt + ":" + password).getBytes(StandardCharsets.UTF_8));
            return HEX.formatHex(hashed);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponível", exception);
        }
    }

    public static boolean matches(String password, String salt, String expectedHash) {
        return hash(password, salt).equals(expectedHash);
    }
}
