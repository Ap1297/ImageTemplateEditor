package com.example.birthdayapp.service;

import com.example.birthdayapp.model.Template;
import com.example.birthdayapp.model.TextElement;
import com.example.birthdayapp.repository.TemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class TemplateService {

    private final TemplateRepository templateRepository;
    
    @Value("${app.upload.dir:${user.home}/birthday-app/uploads}")
    private String uploadDir;

    @Autowired
    public TemplateService(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    public Template saveTemplate(MultipartFile file) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        
        // Save file
        Files.copy(file.getInputStream(), filePath);
        
        // Create and save template entity
        Template template = new Template();
        template.setId(UUID.randomUUID().toString());
        template.setImagePath(filePath.toString());
        template.setOriginalFilename(file.getOriginalFilename());
        
        return templateRepository.save(template);
    }

    public Template getTemplate(String id) {
        return templateRepository.findById(id).orElse(null);
    }

    public List<Template> getAllTemplates() {
        return templateRepository.findAll();
    }

    public Template updateTemplate(String id, Template template) {
        if (templateRepository.existsById(id)) {
            template.setId(id);
            return templateRepository.save(template);
        }
        return null;
    }

    public boolean deleteTemplate(String id) {
        Template template = templateRepository.findById(id).orElse(null);
        if (template != null) {
            // Delete the image file
            try {
                Files.deleteIfExists(Paths.get(template.getImagePath()));
            } catch (IOException e) {
                // Log error but continue with deletion from database
                e.printStackTrace();
            }
            
            templateRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public byte[] generateImage(String id, String name, String birthdate, String quote) throws IOException {
        Template template = templateRepository.findById(id).orElseThrow(() -> 
            new RuntimeException("Template not found with id: " + id));
        
        // Load the template image
        BufferedImage image = ImageIO.read(new File(template.getImagePath()));
        
        // Create a graphics context to draw on the image
        Graphics2D g2d = image.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Draw text elements
        if (template.getElements() != null) {
            for (TextElement element : template.getElements()) {
                g2d.setFont(new Font("Arial", Font.PLAIN, element.getFontSize()));
                g2d.setColor(Color.decode(element.getColor()));
                
                String text = element.getText();
                if ("name".equals(element.getType()) && name != null && !name.isEmpty()) {
                    text = name;
                } else if ("birthdate".equals(element.getType()) && birthdate != null && !birthdate.isEmpty()) {
                    text = birthdate;
                } else if ("quote".equals(element.getType()) && quote != null && !quote.isEmpty()) {
                    text = quote;
                }
                
                g2d.drawString(text, element.getX(), element.getY());
            }
        }
        
        g2d.dispose();
        
        // Convert the image to a byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);
        return baos.toByteArray();
    }
}
