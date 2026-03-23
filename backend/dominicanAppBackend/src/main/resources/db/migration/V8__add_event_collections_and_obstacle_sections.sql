-- 1. Tabela przechowująca daty dni tacowych/komunijnych dla wydarzeń specjalnych
CREATE TABLE special_event_collection_dates (
                                                special_event_id BIGINT NOT NULL REFERENCES special_events(id) ON DELETE CASCADE,
                                                collection_date DATE NOT NULL
);

-- 2. Tabela łącznikowa (Wiele-do-Wielu) dla przeszkód i pór dnia (sekcji)
CREATE TABLE obstacle_task_sections (
                                        obstacle_id BIGINT NOT NULL REFERENCES obstacles(id) ON DELETE CASCADE,
                                        task_section_id BIGINT NOT NULL REFERENCES task_sections(id) ON DELETE CASCADE,
                                        PRIMARY KEY (obstacle_id, task_section_id)
);