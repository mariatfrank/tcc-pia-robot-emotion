package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.domain.AppUser;
import br.edu.piarobot.poc.dto.LoginUserRequest;
import br.edu.piarobot.poc.dto.RegisterUserRequest;
import br.edu.piarobot.poc.dto.UpdateUserPasswordRequest;
import br.edu.piarobot.poc.dto.UpdateUserProfileRequest;
import br.edu.piarobot.poc.dto.UserProfileResponse;
import br.edu.piarobot.poc.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PASSWORD_UPPER = Pattern.compile("[A-Z]");
    private static final Pattern PASSWORD_DIGIT = Pattern.compile("[0-9]");

    private final AppUserRepository appUserRepository;
    private final PasswordResetEmailService passwordResetEmailService;

    public UserService(
            AppUserRepository appUserRepository,
            PasswordResetEmailService passwordResetEmailService
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordResetEmailService = passwordResetEmailService;
    }

    @Transactional
    public UserProfileResponse register(RegisterUserRequest request) {
        String email = normalizeEmail(request.email());
        validatePasswordStrength(request.password());
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateEmailException(email);
        }
        String salt = PasswordHasher.randomSalt();
        String hash = PasswordHasher.hash(request.password(), salt);
        AppUser user = appUserRepository.save(
                new AppUser(email, request.name().trim(), salt, hash)
        );
        return UserProfileResponse.from(user);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse login(LoginUserRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(InvalidCredentialsException::new);
        if (!PasswordHasher.matches(request.password(), user.getSalt(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return UserProfileResponse.from(user);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String ownerEmail) {
        return UserProfileResponse.from(requireUser(ownerEmail));
    }

    @Transactional
    public UserProfileResponse updateProfile(String ownerEmail, UpdateUserProfileRequest request) {
        AppUser user = requireUser(ownerEmail);
        user.setName(request.name().trim());
        return UserProfileResponse.from(user);
    }

    @Transactional
    public void updatePassword(String ownerEmail, UpdateUserPasswordRequest request) {
        validatePasswordStrength(request.newPassword());
        AppUser user = requireUser(ownerEmail);
        if (!PasswordHasher.matches(request.currentPassword(), user.getSalt(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        String salt = PasswordHasher.randomSalt();
        user.updatePassword(salt, PasswordHasher.hash(request.newPassword(), salt));
    }

    @Transactional
    public void forgotPassword(String email) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("E-mail não cadastrado."));
        String temporaryPassword = PasswordHasher.randomTemporaryPassword();
        String salt = PasswordHasher.randomSalt();
        user.updatePassword(salt, PasswordHasher.hash(temporaryPassword, salt));
        passwordResetEmailService.sendTemporaryPassword(user.getEmail(), user.getName(), temporaryPassword);
    }

    private AppUser requireUser(String ownerEmail) {
        String email = normalizeEmail(ownerEmail);
        if (email == null) {
            throw new ResourceNotFoundException("Informe o cabeçalho X-Pia-User-Email.");
        }
        return appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }

    private static String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return null;
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        if (!EMAIL.matcher(normalized).matches()) {
            throw new IllegalArgumentException("E-mail inválido.");
        }
        return normalized;
    }

    private static void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("A senha deve ter pelo menos 8 caracteres.");
        }
        if (!PASSWORD_UPPER.matcher(password).find()) {
            throw new IllegalArgumentException("Inclua pelo menos uma letra maiúscula.");
        }
        if (!PASSWORD_DIGIT.matcher(password).find()) {
            throw new IllegalArgumentException("Inclua pelo menos um número.");
        }
    }
}
