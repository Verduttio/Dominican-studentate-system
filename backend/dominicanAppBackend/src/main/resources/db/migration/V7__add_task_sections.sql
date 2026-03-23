-- 1. Tworzenie tabeli słownikowej dla sekcji
CREATE TABLE task_sections (
                               id BIGSERIAL PRIMARY KEY,
                               name VARCHAR(255) NOT NULL UNIQUE
);

-- 2. Wstawienie domyślnych wartości (aby zminimalizować ręczną pracę)
INSERT INTO task_sections (name) VALUES
                                     ('Rano'),
                                     ('Przedpołudnie'),
                                     ('Popołudnie'),
                                     ('Wieczór'),
                                     ('Liturgia');

-- 3. Tworzenie tabeli łącznikowej (Wiele-do-Wielu: Task <-> TaskSection)
CREATE TABLE task_task_sections (
                                    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
                                    task_section_id BIGINT NOT NULL REFERENCES task_sections(id) ON DELETE CASCADE,
                                    PRIMARY KEY (task_id, task_section_id)
);

-- 4. Dodanie kolumny do tabeli wyznaczeń (schedule)
-- Jest nullable, bo zwykłe wyznaczanie ma tu NULL
ALTER TABLE schedule
    ADD COLUMN task_section_id BIGINT REFERENCES task_sections(id);