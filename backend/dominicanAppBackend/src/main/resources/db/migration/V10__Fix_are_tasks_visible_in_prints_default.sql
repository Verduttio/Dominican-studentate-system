ALTER TABLE roles
    ALTER COLUMN are_tasks_visible_in_prints SET DEFAULT FALSE;

UPDATE roles
SET are_tasks_visible_in_prints = TRUE
WHERE type = 'SUPERVISOR';