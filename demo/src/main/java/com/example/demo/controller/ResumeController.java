package com.example.demo.controller;

import com.example.demo.service.AiService;
import com.example.demo.service.ResumeParserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "*") // Allows React frontend to access these APIs
public class ResumeController {

    @Autowired
    private ResumeParserService resumeParserService;

    @Autowired
    private AiService aiService;

    /**
     * Endpoint 1: Upload PDF Resume -> Get Score, Skills & Suggestions
     * URL: POST http://localhost:8080/api/resume/analyze
     */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> analyzeResume(@RequestParam("file") MultipartFile file) {
        try {
            // Check if file is provided and is a PDF
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Please upload a valid file!\"}");
            }
            if (!file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest().body("{\"error\": \"Only PDF files are supported!\"}");
            }

            // Step 1: Extract text using Apache PDFBox
            String resumeText = resumeParserService.extractTextFromPdf(file);

            // Step 2: Send text to AI for analysis
            String aiAnalysis = aiService.analyzeResume(resumeText);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(aiAnalysis);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("{\"error\": \"Analysis failed: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Endpoint 2: Upload PDF Resume + Job Description -> Get Match Score & Missing Skills
     * URL: POST http://localhost:8080/api/resume/match-job
     */
    @PostMapping(value = "/match-job", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> matchJob(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobDescription") String jobDescription) {
        try {
            if (file.isEmpty() || jobDescription == null || jobDescription.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("{\"error\": \"Both Resume file and Job Description are required!\"}");
            }

            // Step 1: Extract text from PDF
            String resumeText = resumeParserService.extractTextFromPdf(file);

            // Step 2: Compare Resume text vs Job Description using AI
            String matchReport = aiService.matchJob(resumeText, jobDescription);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(matchReport);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("{\"error\": \"Job match failed: " + e.getMessage() + "\"}");
        }
    }
}