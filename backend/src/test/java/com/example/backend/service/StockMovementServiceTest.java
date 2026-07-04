package com.example.backend.service;

import com.example.backend.dto.StockMovementRequest;
import com.example.backend.entity.MovementType;
import com.example.backend.entity.Product;
import com.example.backend.entity.StockMovement;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.StockMovementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StockMovementServiceTest {

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private StockMovementService stockMovementService;

    @Test
    void createInMovementShouldIncreaseProductQuantity() {
        Product product = createProduct(1L, 10);

        StockMovementRequest request = new StockMovementRequest(
                1L,
                MovementType.IN,
                5,
                "Réception fournisseur"
        );

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(stockMovementRepository.save(any(StockMovement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        StockMovement movement = stockMovementService.create(request);

        assertEquals(15, product.getQuantity());
        assertEquals(MovementType.IN, movement.getMovementType());
        assertEquals(5, movement.getQuantity());
        assertEquals("Réception fournisseur", movement.getReason());

        verify(productRepository).findById(1L);
        verify(productRepository).save(product);
        verify(stockMovementRepository).save(any(StockMovement.class));
    }

    @Test
    void createOutMovementShouldDecreaseProductQuantity() {
        Product product = createProduct(1L, 10);

        StockMovementRequest request = new StockMovementRequest(
                1L,
                MovementType.OUT,
                4,
                "Sortie stock"
        );

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(stockMovementRepository.save(any(StockMovement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        StockMovement movement = stockMovementService.create(request);

        assertEquals(6, product.getQuantity());
        assertEquals(MovementType.OUT, movement.getMovementType());
        assertEquals(4, movement.getQuantity());
        assertEquals("Sortie stock", movement.getReason());

        verify(productRepository).findById(1L);
        verify(productRepository).save(product);
        verify(stockMovementRepository).save(any(StockMovement.class));
    }

    @Test
    void createOutMovementShouldThrowExceptionWhenStockIsInsufficient() {
        Product product = createProduct(1L, 3);

        StockMovementRequest request = new StockMovementRequest(
                1L,
                MovementType.OUT,
                5,
                "Sortie impossible"
        );

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> stockMovementService.create(request)
        );

        assertEquals("Stock insuffisant", exception.getMessage());
        assertEquals(3, product.getQuantity());

        verify(productRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
        verify(stockMovementRepository, never()).save(any(StockMovement.class));
    }

    @Test
    void createMovementShouldThrowExceptionWhenProductDoesNotExist() {
        StockMovementRequest request = new StockMovementRequest(
                99L,
                MovementType.IN,
                5,
                "Produit inexistant"
        );

        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> stockMovementService.create(request)
        );

        assertEquals("Produit introuvable", exception.getMessage());

        verify(productRepository).findById(99L);
        verify(productRepository, never()).save(any(Product.class));
        verify(stockMovementRepository, never()).save(any(StockMovement.class));
    }

    private Product createProduct(Long id, int quantity) {
        Product product = new Product();
        product.setId(id);
        product.setReference("PROD-" + id);
        product.setName("Produit " + id);
        product.setDescription("Description");
        product.setQuantity(quantity);
        product.setMinimumQuantity(2);
        return product;
    }
}