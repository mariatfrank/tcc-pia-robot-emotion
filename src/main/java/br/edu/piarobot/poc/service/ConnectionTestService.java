package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.domain.Device;
import br.edu.piarobot.poc.domain.DeviceStatus;
import br.edu.piarobot.poc.domain.DeviceType;
import br.edu.piarobot.poc.dto.ConnectionTestResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.List;

@Service
public class ConnectionTestService {

    private final DeviceService deviceService;
    private final DataSource dataSource;

    public ConnectionTestService(DeviceService deviceService, DataSource dataSource) {
        this.deviceService = deviceService;
        this.dataSource = dataSource;
    }

    @Transactional(readOnly = true)
    public ConnectionTestResponse test(String ownerEmail) {
        boolean backendOk = false;
        String backendMessage = "Backend indisponível.";

        try (Connection connection = dataSource.getConnection()) {
            backendOk = connection.isValid(2);
            backendMessage = backendOk
                    ? "API disponível e comunicação com o banco de dados OK."
                    : "API respondeu, mas o banco de dados não validou a conexão.";
        } catch (Exception ex) {
            backendMessage = "Falha ao conectar com o banco de dados: " + ex.getMessage();
        }

        if (!StringUtils.hasText(ownerEmail)) {
            return new ConnectionTestResponse(
                    backendOk,
                    backendMessage,
                    false,
                    "Celular (olhos): faça login no painel web.",
                    false,
                    "Tablet (jogo): faça login no painel web.",
                    ""
            );
        }

        List<Device> devices = deviceService.listAll(ownerEmail);
        boolean eyes = devices.stream()
                .anyMatch(device -> device.getType() == DeviceType.EYES_PHONE
                        && device.getStatus() == DeviceStatus.ACTIVE);
        boolean tablet = devices.stream()
                .anyMatch(device -> device.getType() == DeviceType.GAME_TABLET
                        && device.getStatus() == DeviceStatus.ACTIVE);

        String eyesMessage = eyes
                ? "Celular (olhos): dispositivo ativo encontrado."
                : "Celular (olhos): nenhum dispositivo ativo.";
        String tabletMessage = tablet
                ? "Tablet (jogo): dispositivo ativo encontrado."
                : "Tablet (jogo): nenhum dispositivo ativo.";

        return new ConnectionTestResponse(
                backendOk,
                backendMessage,
                eyes,
                eyesMessage,
                tablet,
                tabletMessage,
                ""
        );
    }
}
