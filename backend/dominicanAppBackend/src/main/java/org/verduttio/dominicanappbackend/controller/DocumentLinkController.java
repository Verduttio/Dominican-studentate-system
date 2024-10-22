package org.verduttio.dominicanappbackend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.domain.DocumentLink;
import org.verduttio.dominicanappbackend.service.DocumentLinkService;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/document-links")
public class DocumentLinkController {
    private final DocumentLinkService documentLinkService;

    public DocumentLinkController(DocumentLinkService documentLinkService) {
        this.documentLinkService = documentLinkService;
    }

    @GetMapping("/{documentLinkId}")
    public ResponseEntity<?> getDocumentLinkById(@PathVariable Long documentLinkId) {
        DocumentLink documentLink;
        try {
            documentLink = documentLinkService.getById(documentLinkId);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(documentLink, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<DocumentLink>> getAllDocumentLinks() {
        List<DocumentLink> documentLinks = documentLinkService.getAllByOrderBySortOrderAsc();
        return new ResponseEntity<>(documentLinks, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<DocumentLink> createDocumentLink(@RequestBody DocumentLink documentLink) {
        DocumentLink savedDocumentLink = documentLinkService.save(documentLink);
        return new ResponseEntity<>(savedDocumentLink, HttpStatus.CREATED);
    }

    @PutMapping("/{documentLinkId}")
    public ResponseEntity<?> updateDocumentLink(@PathVariable Long documentLinkId, @RequestBody DocumentLink updatedDocumentLink) {
        updatedDocumentLink.setId(documentLinkId);
        DocumentLink savedDocumentLink;
        try {
            savedDocumentLink = documentLinkService.update(updatedDocumentLink);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(savedDocumentLink, HttpStatus.OK);
    }

    @DeleteMapping("/{documentLinkId}")
    public ResponseEntity<?> deleteDocumentLink(@PathVariable Long documentLinkId) {
        try {
            documentLinkService.deleteById(documentLinkId);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
