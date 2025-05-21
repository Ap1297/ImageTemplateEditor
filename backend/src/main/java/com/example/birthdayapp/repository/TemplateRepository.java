package com.example.birthdayapp.repository;

import com.example.birthdayapp.model.Template;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateRepository extends JpaRepository<Template, String> {
    // Spring Data JPA provides basic CRUD operations
}
