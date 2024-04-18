SELECT setval('role_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('conflict_id_seq', (SELECT MAX(id) FROM conflicts));
SELECT setval('obstacle_id_seq', (SELECT MAX(id) FROM obstacles));
SELECT setval('schedule_id_seq', (SELECT MAX(id) FROM schedule));
SELECT setval('task_id_seq', (SELECT MAX(id) FROM tasks));
SELECT setval('user_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('special_date_id_seq', (SELECT MAX(id) FROM special_dates));
