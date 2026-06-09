package br.edu.piarobot.poc.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PasswordResetEmailService {

    private static final String SUBJECT = "Redefinição de Senha Pia Robot";

    private final JavaMailSender mailSender;
    private final String from;

    public PasswordResetEmailService(
            JavaMailSender mailSender,
            @Value("${pia.mail.from:}") String from
    ) {
        this.mailSender = mailSender;
        this.from = from;
    }

    public void sendTemporaryPassword(String email, String name, String temporaryPassword) {
        if (!StringUtils.hasText(from)) {
            throw new EmailDeliveryException("Remetente de e-mail não configurado.", null);
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(email);
        message.setSubject(SUBJECT);
        message.setText(buildBody(name, temporaryPassword));

        try {
            mailSender.send(message);
        } catch (MailAuthenticationException exception) {
            throw new EmailDeliveryException(
                    "O Gmail recusou a autenticação. Use uma senha de app do Gmail para enviar e-mails.",
                    exception
            );
        } catch (MailException exception) {
            throw new EmailDeliveryException("Não foi possível enviar o e-mail de redefinição.", exception);
        }
    }

    private String buildBody(String name, String temporaryPassword) {
        return String.join(System.lineSeparator(),
                "Olá, " + name + ".",
                "",
                "Recebemos uma solicitação de redefinição de senha para sua conta Pia Robot.",
                "Sua senha temporária é: " + temporaryPassword,
                "",
                "Use essa senha temporária para entrar e altere-a no seu perfil.",
                "",
                "Caso você não tenha solicitado essa redefinição, ignore este e-mail."
        );
    }
}
