package br.edu.piarobot.poc.controller;

import br.edu.piarobot.poc.dto.ForgotPasswordRequest;
import br.edu.piarobot.poc.dto.LoginUserRequest;
import br.edu.piarobot.poc.dto.RegisterUserRequest;
import br.edu.piarobot.poc.dto.UpdateUserPasswordRequest;
import br.edu.piarobot.poc.dto.UpdateUserProfileRequest;
import br.edu.piarobot.poc.dto.UserProfileResponse;
import br.edu.piarobot.poc.openapi.StandardApiResponses;
import br.edu.piarobot.poc.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Usuários", description = "Cadastro, login e perfil do painel web (persistido no PostgreSQL)")
@StandardApiResponses
public class UserController {

    private static final String USER_EMAIL_HEADER = "X-Pia-User-Email";

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Cadastrar usuário", description = "Cria conta com e-mail único e senha com hash SHA-256 + salt.")
    @ApiResponse(responseCode = "201", description = "Usuário criado",
            content = @Content(schema = @Schema(implementation = UserProfileResponse.class)))
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserProfileResponse register(@Valid @RequestBody RegisterUserRequest request) {
        return userService.register(request);
    }

    @Operation(summary = "Login", description = "Valida credenciais e retorna o perfil público.")
    @ApiResponse(responseCode = "200", description = "Autenticado",
            content = @Content(schema = @Schema(implementation = UserProfileResponse.class)))
    @ApiResponse(responseCode = "401", description = "Credenciais inválidas")
    @PostMapping("/login")
    public UserProfileResponse login(@Valid @RequestBody LoginUserRequest request) {
        return userService.login(request);
    }

    @Operation(summary = "Obter perfil do usuário logado")
    @ApiResponse(responseCode = "200", description = "Perfil encontrado",
            content = @Content(schema = @Schema(implementation = UserProfileResponse.class)))
    @GetMapping("/me")
    public UserProfileResponse me(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        return userService.getProfile(ownerEmail);
    }

    @Operation(summary = "Atualizar nome do perfil")
    @ApiResponse(responseCode = "200", description = "Perfil atualizado",
            content = @Content(schema = @Schema(implementation = UserProfileResponse.class)))
    @PutMapping("/me")
    public UserProfileResponse updateProfile(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail,
            @Valid @RequestBody UpdateUserProfileRequest request
    ) {
        return userService.updateProfile(ownerEmail, request);
    }

    @Operation(summary = "Atualizar senha", description = "Exige senha atual válida.")
    @ApiResponse(responseCode = "204", description = "Senha atualizada")
    @ApiResponse(responseCode = "401", description = "Senha atual incorreta")
    @PutMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updatePassword(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail,
            @Valid @RequestBody UpdateUserPasswordRequest request
    ) {
        userService.updatePassword(ownerEmail, request);
    }

    @Operation(summary = "Recuperar senha", description = "Gera senha temporária, atualiza no banco e envia por e-mail.")
    @ApiResponse(responseCode = "202", description = "Solicitação aceita (e-mail enviado se SMTP configurado)")
    @ApiResponse(responseCode = "502", description = "Falha no envio do e-mail")
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.email());
        return ResponseEntity.accepted().build();
    }
}
