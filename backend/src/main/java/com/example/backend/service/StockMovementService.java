package com.example.backend.service;

import com.example.backend.dto.StockMovementRequest;
import com.example.backend.entity.MovementType;
import com.example.backend.entity.Product;
import com.example.backend.entity.StockMovement;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.StockMovementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;

    public StockMovementService(
            StockMovementRepository stockMovementRepository,
            ProductRepository productRepository
    ) {
        this.stockMovementRepository = stockMovementRepository;
        this.productRepository = productRepository;
    }

    public List<StockMovement> findAll() {
        return stockMovementRepository.findAll();
    }

    @Transactional
    public StockMovement create(StockMovementRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new IllegalArgumentException("Produit introuvable"));

        if (request.movementType() == MovementType.IN) {
            product.setQuantity(product.getQuantity() + request.quantity());
        } else if (request.movementType() == MovementType.OUT) {
            if (product.getQuantity() < request.quantity()) {
                throw new IllegalArgumentException("Stock insuffisant");
            }

            product.setQuantity(product.getQuantity() - request.quantity());
        }

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setMovementType(request.movementType());
        movement.setQuantity(request.quantity());
        movement.setReason(request.reason());

        productRepository.save(product);

        return stockMovementRepository.save(movement);
    }
}