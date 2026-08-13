package com.careconnect.service;

import com.careconnect.dto.response.SpecialityDto;
import com.careconnect.entity.Speciality;
import com.careconnect.exception.ResourceNotFoundException;
import com.careconnect.repository.SpecialityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpecialityService {

    private final SpecialityRepository specialityRepository;

    @Transactional(readOnly = true)
    public List<SpecialityDto> getAllSpecialities() {
        return specialityRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SpecialityDto getSpecialityById(Integer id) {
        Speciality speciality = specialityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Speciality", "id", id));
        return mapToDto(speciality);
    }

    public SpecialityDto mapToDto(Speciality entity) {
        if (entity == null) return null;
        return SpecialityDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .imageUrl(entity.getImageUrl())
                .build();
    }
}
