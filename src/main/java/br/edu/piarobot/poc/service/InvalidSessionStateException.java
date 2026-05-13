package br.edu.piarobot.poc.service;

public class InvalidSessionStateException extends RuntimeException {

    public InvalidSessionStateException(String message) {
        super(message);
    }
}
