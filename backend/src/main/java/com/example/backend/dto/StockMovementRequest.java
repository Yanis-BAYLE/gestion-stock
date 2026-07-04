package com.example.backend.dto;

import com.example.backend.entity.MovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockMovementRequest(
        @NotNull Long productId,
        @NotNull MovementType movementType,
        @NotNull @Min(1) Integer quantity,
        String reason
) {
}