WITH numbered_tasks AS (
    SELECT
        id,
        role_id,
        ROW_NUMBER() OVER (PARTITION BY role_id ORDER BY id) AS rn
    FROM tasks
)
UPDATE tasks t
SET sort_order = n.rn
FROM numbered_tasks n
WHERE t.id = n.id;