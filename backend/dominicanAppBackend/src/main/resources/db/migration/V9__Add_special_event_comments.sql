CREATE SEQUENCE IF NOT EXISTS special_event_comments_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE special_event_comments
(
    id               BIGINT       NOT NULL,
    special_event_id BIGINT       NOT NULL,
    date             date         NOT NULL,
    role_name        VARCHAR(255) NOT NULL,
    task_section_id  BIGINT,
    content          TEXT,
    CONSTRAINT pk_special_event_comments PRIMARY KEY (id)
);

ALTER TABLE special_event_comments
    ADD CONSTRAINT fk_special_event_comments_on_special_event FOREIGN KEY (special_event_id) REFERENCES special_events (id);

ALTER TABLE special_event_comments
    ADD CONSTRAINT fk_special_event_comments_on_task_section FOREIGN KEY (task_section_id) REFERENCES task_sections (id);