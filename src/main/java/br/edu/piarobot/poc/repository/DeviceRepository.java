package br.edu.piarobot.poc.repository;

import br.edu.piarobot.poc.domain.Device;
import br.edu.piarobot.poc.domain.DeviceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {

    List<Device> findAllByStatusOrderByCreatedAtDesc(DeviceStatus status);
}
