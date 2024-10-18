ALTER TABLE roles
    ADD assigned_tasks_group_name VARCHAR(255) DEFAULT '' NOT NULL;

ALTER TABLE roles
    ADD sort_order BIGINT DEFAULT 0 NOT NULL;

-- Assign sequentially values to sort_order column
WITH ordered_roles AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM roles
)
UPDATE roles r
SET sort_order = o.rn
FROM ordered_roles o
WHERE r.id = o.id;