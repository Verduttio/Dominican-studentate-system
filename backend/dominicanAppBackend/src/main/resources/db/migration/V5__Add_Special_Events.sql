-- 1. Tabela wydarzeń specjalnych
CREATE TABLE special_events (
                                id BIGSERIAL PRIMARY KEY,
                                name VARCHAR(255) NOT NULL,
                                start_date DATE NOT NULL,
                                end_date DATE NOT NULL
);

-- 2. Modyfikacja tabeli task (dodanie relacji)
ALTER TABLE tasks
    ADD COLUMN special_event_id BIGINT;

ALTER TABLE tasks
    ADD CONSTRAINT fk_task_special_event
        FOREIGN KEY (special_event_id)
            REFERENCES special_events(id)
            ON DELETE CASCADE; -- Usunięcie eventu usuwa jego zadania

-- 3. Indeks dla wydajności przy wyszukiwaniu po dacie
CREATE INDEX idx_special_events_dates ON special_events (start_date, end_date);