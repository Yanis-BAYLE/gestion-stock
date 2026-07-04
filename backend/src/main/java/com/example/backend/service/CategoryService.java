package com.example.backend.service;

import com.example.backend.dto.CategoryRequest;
import com.example.backend.entity.Category;
import com.example.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category create(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name());
        return categoryRepository.save(category);
    }
}