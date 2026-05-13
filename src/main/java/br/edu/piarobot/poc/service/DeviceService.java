package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.domain.Device;
import br.edu.piarobot.poc.domain.DeviceStatus;
import br.edu.piarobot.poc.dto.RegisterDeviceRequest;
import br.edu.piarobot.poc.repository.DeviceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;

    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    @Transactional
    public Device register(RegisterDeviceRequest request) {
        return deviceRepository.save(new Device(request.name(), request.type()));
    }

    @Transactional(readOnly = true)
    public List<Device> listActive() {
        return deviceRepository.findAllByStatusOrderByCreatedAtDesc(DeviceStatus.ACTIVE);
    }

    @Transactional
    public void deactivate(UUID id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispositivo não encontrado: " + id));
        device.deactivate();
    }
}
