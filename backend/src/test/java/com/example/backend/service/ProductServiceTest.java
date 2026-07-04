package com.example.backend.service;

import com.example.backend.dto.ProductRequest;
import com.example.backend.entity.Product;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.SupplierRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void createProductShouldSaveProductWhenReferenceDoesNotExist() {
        ProductRequest request = new ProductRequest(
                "TEST-001",
                "Produit test",
                "Description test",
                10,
                2,
                null,
                null
        );

        when(productRepository.existsByReference("TEST-001")).thenReturn(false);
        when(productRepository.save(any(Product.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Product createdProduct = productService.create(request);

        assertEquals("TEST-001", createdProduct.getReference());
        assertEquals("Produit test", createdProduct.getName());
        assertEquals("Description test", createdProduct.getDescription());
        assertEquals(10, createdProduct.getQuantity());
        assertEquals(2, createdProduct.getMinimumQuantity());

        verify(productRepository).existsByReference("TEST-001");
        verify(productRepository).save(any(Product.class));
        verifyNoInteractions(categoryRepository);
        verifyNoInteractions(supplierRepository);
    }

    @Test
    void createProductShouldThrowExceptionWhenReferenceAlreadyExists() {
        ProductRequest request = new ProductRequest(
                "TEST-001",
                "Produit test",
                "Description test",
                10,
                2,
                null,
                null
        );

        when(productRepository.existsByReference("TEST-001")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> productService.create(request)
        );

        assertEquals("La référence produit existe déjà", exception.getMessage());

        verify(productRepository).existsByReference("TEST-001");
        verify(productRepository, never()).save(any(Product.class));
    }
}