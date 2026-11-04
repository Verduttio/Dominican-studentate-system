
-- Ustawienia globalne: wartości tekstowe pozwalają przechowywać
-- liczby, wartości logiczne i tekst.
CREATE TABLE global_settings
(
    id            BIGSERIAL PRIMARY KEY,
    setting_key   VARCHAR(50)  NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL
);

-- Odtworzenie dotychczasowych stawek i dodanie ustawień życzeń.
INSERT INTO global_settings (setting_key, setting_value)
VALUES
    ('pocket_money_rate', '100'),
    ('nameday_money_rate', '50'),
    ('wishes_visibility', 'true'),
    ('wishes_title', 'Życzenia Bożonarodzeniowe');

-- Tabela życzeń.
CREATE TABLE wishes
(
    id        BIGSERIAL PRIMARY KEY,
    recipient VARCHAR(255),
    email     TEXT,
    is_letter BOOLEAN NOT NULL DEFAULT FALSE,
    user_id   BIGINT,
    message   TEXT,
    is_sent   BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_wishes_on_user
        FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_wishes_user_id ON wishes (user_id);
