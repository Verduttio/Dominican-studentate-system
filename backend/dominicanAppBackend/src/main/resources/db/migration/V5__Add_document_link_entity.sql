CREATE SEQUENCE IF NOT EXISTS document_link_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE document_links
(
    id         BIGINT NOT NULL,
    title      VARCHAR(255),
    url        VARCHAR(255),
    sort_order BIGINT NOT NULL,
    CONSTRAINT pk_document_links PRIMARY KEY (id)
);