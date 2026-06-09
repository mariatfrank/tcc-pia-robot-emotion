package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.domain.Device;
import br.edu.piarobot.poc.domain.DeviceStatus;
import br.edu.piarobot.poc.domain.DeviceType;
import br.edu.piarobot.poc.dto.RegisterDeviceRequest;
import br.edu.piarobot.poc.repository.DeviceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;

    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    @Transactional
    public Device register(RegisterDeviceRequest request, String ownerEmail) {
        String owner = normalizeOwner(ownerEmail);
        if (owner == null) {
            owner = normalizeOwner(request.ownerEmail());
        }
        if (owner != null) {
            List<Device> activeSameType = deviceRepository
                    .findAllByOwnerEmailAndTypeAndStatusOrderByCreatedAtDesc(owner, request.type(), DeviceStatus.ACTIVE);
            if (!activeSameType.isEmpty()) {
                Device current = activeSameType.getFirst();
                current.updateSession(request.sessionId());
                activeSameType.stream().skip(1).forEach(Device::deactivate);
                return current;
            }
        }
        return deviceRepository.save(
                new Device(request.name(), request.type(), owner, request.sessionId())
        );
    }

    @Transactional(readOnly = true)
    public Device get(UUID id) {
        return deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispositivo não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<Device> listAll(String ownerEmail) {
        String owner = normalizeOwner(ownerEmail);
        if (owner != null) {
            return deviceRepository.findAllByOwnerEmailOrderByCreatedAtDesc(owner);
        }
        return deviceRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Device> listActive() {
        return deviceRepository.findAllByStatusOrderByCreatedAtDesc(DeviceStatus.ACTIVE);
    }

    @Transactional
    public void syncSessionForOwner(String ownerEmail, UUID sessionId) {
        String owner = normalizeOwner(ownerEmail);
        if (owner == null || sessionId == null) {
            return;
        }
        for (DeviceType type : DeviceType.values()) {
            deviceRepository
                    .findAllByOwnerEmailAndTypeAndStatusOrderByCreatedAtDesc(owner, type, DeviceStatus.ACTIVE)
                    .forEach(device -> device.updateSession(sessionId));
        }
    }

    @Transactional
    public void deactivate(UUID id, String ownerEmail) {
        String owner = normalizeOwner(ownerEmail);
        Device device = (owner == null ? deviceRepository.findById(id) : deviceRepository.findByIdAndOwnerEmail(id, owner))
                .orElseThrow(() -> new ResourceNotFoundException("Dispositivo não encontrado: " + id));
        if (owner != null) {
            deviceRepository
                    .findAllByOwnerEmailAndTypeAndStatusOrderByCreatedAtDesc(owner, device.getType(), DeviceStatus.ACTIVE)
                    .forEach(Device::deactivate);
        } else {
            device.deactivate();
        }
    }

    private String normalizeOwner(String ownerEmail) {
        if (!StringUtils.hasText(ownerEmail)) {
            return null;
        }
        return ownerEmail.trim().toLowerCase();
    }
}
