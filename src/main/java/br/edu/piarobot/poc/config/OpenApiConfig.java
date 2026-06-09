package br.edu.piarobot.poc.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.media.StringSchema;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.method.HandlerMethod;

import java.util.Arrays;

@Configuration
public class OpenApiConfig {

    public static final String USER_EMAIL_HEADER = "X-Pia-User-Email";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API de Serviços Piá Robot Emotion")
                        .version("0.1.0")
                        .description("""
                                API REST do backend Piá Robot Emotion (UFPR, 2026). \
                                Usuários, sessões, dispositivos e emoções são persistidos no PostgreSQL. \
                                A sessão do painel web permanece no localStorage \
                                do navegador via chave pia_robot_auth_session_v1, identificada pelo header \
                                X-Pia-User-Email nas requisições.
                                """)
                        .contact(new Contact()
                                .name("Piá Robot Emotion")
                                .url("https://www.ufpr.br")))
                .components(new Components()
                        .addParameters(USER_EMAIL_HEADER, new Parameter()
                                .in("header")
                                .name(USER_EMAIL_HEADER)
                                .description("E-mail do usuário autenticado no painel web (opcional em alguns endpoints).")
                                .required(false)
                                .schema(new StringSchema().format("email"))));
    }

    @Bean
    public OperationCustomizer ownerEmailHeaderCustomizer() {
        return (operation, handlerMethod) -> {
            if (usesOwnerEmailHeader(handlerMethod)) {
                operation.addParametersItem(new Parameter().$ref("#/components/parameters/" + USER_EMAIL_HEADER));
            }
            return operation;
        };
    }

    private static boolean usesOwnerEmailHeader(HandlerMethod handlerMethod) {
        return Arrays.stream(handlerMethod.getMethodParameters())
                .anyMatch(parameter -> {
                    RequestHeader header = parameter.getParameterAnnotation(RequestHeader.class);
                    return header != null && USER_EMAIL_HEADER.equals(header.value());
                });
    }
}
