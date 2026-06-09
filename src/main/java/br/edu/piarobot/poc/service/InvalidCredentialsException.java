package br.edu.piarobot.poc.service;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Não foi possível entrar. Verifique suas credenciais.");
    }
}
