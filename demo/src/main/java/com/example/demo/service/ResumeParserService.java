package com.example.demo.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ResumeParserService {

    /**
     * Extracts all raw text from an uploaded PDF Resume
     */
    public String extractTextFromPdf(MultipartFile file) throws IOException {
        // Load the uploaded PDF file
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            
            // PDFTextStripper reads text from the document
            PDFTextStripper textStripper = new PDFTextStripper();
            String extractedText = textStripper.getText(document);

            // Clean up extra whitespaces and line breaks
            return extractedText.trim();
        } catch (IOException e) {
            throw new IOException("Failed to extract text from PDF: " + e.getMessage());
        }
    }
}