package br.edu.piarobot.poc.repository;

import br.edu.piarobot.poc.domain.Device;
import br.edu.piarobot.poc.domain.DeviceStatus;
import br.edu.piarobot.poc.domain.DeviceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {

    List<Device> findAllByOrderByCreatedAtDesc();

    List<Device> findAllByOwnerEmailOrderByCreatedAtDesc(String ownerEmail);

    List<Device> findAllByStatusOrderByCreatedAtDesc(DeviceStatus status);

    Optional<Device> findByIdAndOwnerEmail(UUID id, String ownerEmail);

    List<Device> findAllByOwnerEmailAndTypeAndStatusOrderByCreatedAtDesc(
            String ownerEmail,
            DeviceType type,
            DeviceStatus status
    );
}
