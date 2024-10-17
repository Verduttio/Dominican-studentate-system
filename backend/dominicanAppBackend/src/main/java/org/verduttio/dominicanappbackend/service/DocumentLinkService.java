package org.verduttio.dominicanappbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.verduttio.dominicanappbackend.entity.DocumentLink;
import org.verduttio.dominicanappbackend.repository.DocumentLinkRepository;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class DocumentLinkService {
    private final DocumentLinkRepository documentLinkRepository;

    public DocumentLinkService(DocumentLinkRepository documentLinkRepository) {
        this.documentLinkRepository = documentLinkRepository;
    }

    public DocumentLink getById(Long id) {
        return documentLinkRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("DocumentLink with id: " + id + " not found"));
    }

    public List<DocumentLink> getAllByOrderBySortOrderAsc() {
        return documentLinkRepository.findAllByOrderBySortOrderAsc();
    }

    @Transactional
    public DocumentLink save(DocumentLink documentLink) {
        documentLinkRepository.incrementSortOrderGreaterThanOrEqualTo(documentLink.getSortOrder());
        return documentLinkRepository.save(documentLink);
    }

    @Transactional
    public DocumentLink update(DocumentLink documentLink) {
        DocumentLink existingDocumentLink = documentLinkRepository.findById(documentLink.getId())
                .orElseThrow(() -> new EntityNotFoundException("DocumentLink with id: " + documentLink.getId() + " not found"));

        if (!existingDocumentLink.getSortOrder().equals(documentLink.getSortOrder())) {
            documentLinkRepository.incrementSortOrderGreaterThanOrEqualTo(documentLink.getSortOrder());
        }

        existingDocumentLink.setTitle(documentLink.getTitle());
        existingDocumentLink.setUrl(documentLink.getUrl());
        existingDocumentLink.setSortOrder(documentLink.getSortOrder());

        return documentLinkRepository.save(existingDocumentLink);
    }

    @Transactional
    public void deleteById(Long id) {
        Optional<DocumentLink> documentLink = documentLinkRepository.findById(id);
        if (documentLink.isPresent()) {
            documentLinkRepository.decrementSortOrderGreaterThan(documentLink.get().getSortOrder());
            documentLinkRepository.deleteById(id);
        }
    }

}
