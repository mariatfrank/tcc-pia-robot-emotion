package br.edu.piarobot.poc.service;

public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String email) {
        super("E-mail já cadastrado: " + email);
    }
}
