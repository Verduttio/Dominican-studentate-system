ALTER TABLE document_links
    ADD preview BOOLEAN DEFAULT TRUE;

ALTER TABLE document_links
    ALTER COLUMN preview SET NOT NULL;