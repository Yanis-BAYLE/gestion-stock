package com.example.backend.controller;

import com.example.backend.dto.SupplierRequest;
import com.example.backend.entity.Supplier;
import com.example.backend.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public List<Supplier> findAll() {
        return supplierService.findAll();
    }

    @PostMapping
    public Supplier create(@Valid @RequestBody SupplierRequest request) {
        return supplierService.create(request);
    }
}