package com.example.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductRequest(
        @NotBlank String reference,
        @NotBlank String name,
        String description,
        @NotNull @Min(0) Integer quantity,
        @NotNull @Min(0) Integer minimumQuantity,
        Long categoryId,
        Long supplierId
) {
}