ALTER TABLE users ADD COLUMN academic_year INT;
ALTER TABLE users ADD COLUMN nameday_date DATE; -- Przechowujemy jako datę (rok nieistotny dla logiki imienin)

-- Opcjonalnie: Tabela na ustawienia globalne (kwoty)
CREATE TABLE global_settings (
                                 id SERIAL PRIMARY KEY,
                                 setting_key VARCHAR(50) UNIQUE NOT NULL,
                                 setting_value INT NOT NULL
);

INSERT INTO global_settings (setting_key, setting_value) VALUES ('pocket_money_rate', 100);
INSERT INTO global_settings (setting_key, setting_value) VALUES ('nameday_money_rate', 50);