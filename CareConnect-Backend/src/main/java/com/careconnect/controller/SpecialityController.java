package com.careconnect.controller;

import com.careconnect.dto.response.ApiResponse;
import com.careconnect.dto.response.SpecialityDto;
import com.careconnect.service.SpecialityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Specialities", description = "Medical Speciality Master Catalogue Endpoints")
public class SpecialityController {

    private final SpecialityService specialityService;

    @GetMapping({"/api/v1/specialities", "/doctor/specialities/"})
    @Operation(summary = "Fetch all medical specialities")
    public ResponseEntity<List<SpecialityDto>> getAllSpecialities() {
        List<SpecialityDto> specialities = specialityService.getAllSpecialities();
        return ResponseEntity.ok(specialities);
    }

    @GetMapping("/api/v1/specialities/{id}")
    @Operation(summary = "Fetch speciality by ID")
    public ResponseEntity<ApiResponse<SpecialityDto>> getSpecialityById(@PathVariable Integer id) {
        SpecialityDto speciality = specialityService.getSpecialityById(id);
        return ResponseEntity.ok(ApiResponse.success(speciality));
    }
}
