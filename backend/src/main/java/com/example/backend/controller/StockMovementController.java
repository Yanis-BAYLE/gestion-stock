package com.example.backend.controller;

import com.example.backend.dto.StockMovementRequest;
import com.example.backend.entity.StockMovement;
import com.example.backend.service.StockMovementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @GetMapping
    public List<StockMovement> findAll() {
        return stockMovementService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StockMovement create(@Valid @RequestBody StockMovementRequest request) {
        return stockMovementService.create(request);
    }
}