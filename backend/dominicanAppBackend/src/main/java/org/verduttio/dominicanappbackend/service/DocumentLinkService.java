package org.verduttio.dominicanappbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.verduttio.dominicanappbackend.entity.DocumentLink;
import org.verduttio.dominicanappbackend.repository.DocumentLinkRepository;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;

import java.util.List;

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

    public DocumentLink update(DocumentLink documentLink) {
        if (documentLinkRepository.existsById(documentLink.getId())) {
            documentLinkRepository.incrementSortOrderGreaterThanOrEqualTo(documentLink.getSortOrder());
            return documentLinkRepository.save(documentLink);
        } else {
            throw new EntityNotFoundException("DocumentLink with id: " + documentLink.getId() + " not found");
        }
    }

    public void deleteById(Long id) {
        documentLinkRepository.deleteById(id);
    }

}
