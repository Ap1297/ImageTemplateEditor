package com.example.birthdayapp.controller;

import com.example.birthdayapp.model.Template;
import com.example.birthdayapp.service.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "*") // For development - restrict in production
public class TemplateController {

    private final TemplateService templateService;

    @Autowired
    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Template> uploadTemplate(@RequestParam("file") MultipartFile file) {
        try {
            Template template = templateService.saveTemplate(file);
            return new ResponseEntity<>(template, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Template> getTemplate(@PathVariable String id) {
        Template template = templateService.getTemplate(id);
        if (template != null) {
            return new ResponseEntity<>(template, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    public ResponseEntity<List<Template>> getAllTemplates() {
        List<Template> templates = templateService.getAllTemplates();
        return new ResponseEntity<>(templates, HttpStatus.OK);
    }

    @PostMapping("/{id}/generate")
    public ResponseEntity<byte[]> generateImage(
            @PathVariable String id,
            @RequestParam String name,
            @RequestParam String birthdate,
            @RequestParam String quote) {
        try {
            byte[] imageData = templateService.generateImage(id, name, birthdate, quote);
            return ResponseEntity
                    .ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(imageData);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Template> updateTemplate(
            @PathVariable String id,
            @RequestBody Template template) {
        Template updatedTemplate = templateService.updateTemplate(id, template);
        if (updatedTemplate != null) {
            return new ResponseEntity<>(updatedTemplate, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        boolean deleted = templateService.deleteTemplate(id);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
