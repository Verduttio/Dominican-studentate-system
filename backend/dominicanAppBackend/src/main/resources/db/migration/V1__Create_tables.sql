CREATE SEQUENCE IF NOT EXISTS conflict_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS obstacle_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS role_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS schedule_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS special_date_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS task_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS user_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE conflict_day_of_week
(
    conflict_id  BIGINT NOT NULL,
    days_of_week VARCHAR(255)
);

CREATE TABLE conflicts
(
    id       BIGINT NOT NULL,
    task1_id BIGINT,
    task2_id BIGINT,
    CONSTRAINT pk_conflicts PRIMARY KEY (id)
);

CREATE TABLE obstacle_tasks
(
    obstacle_id BIGINT NOT NULL,
    task_id     BIGINT NOT NULL,
    CONSTRAINT pk_obstacle_tasks PRIMARY KEY (obstacle_id, task_id)
);

CREATE TABLE obstacles
(
    id                    BIGINT NOT NULL,
    user_id               BIGINT,
    from_date             date,
    to_date               date,
    applicant_description VARCHAR(255),
    status                VARCHAR(255),
    recipient_answer      VARCHAR(255),
    recipient_user_id     BIGINT,
    CONSTRAINT pk_obstacles PRIMARY KEY (id)
);

CREATE TABLE roles
(
    id                                 BIGINT NOT NULL,
    name                               VARCHAR(255),
    type                               VARCHAR(255),
    is_weekly_schedule_creator_default BOOLEAN DEFAULT FALSE,
    CONSTRAINT pk_roles PRIMARY KEY (id)
);

CREATE TABLE schedule
(
    id      BIGINT NOT NULL,
    task_id BIGINT,
    user_id BIGINT,
    date    date,
    CONSTRAINT pk_schedule PRIMARY KEY (id)
);

CREATE TABLE special_dates
(
    id   BIGINT NOT NULL,
    date date,
    type VARCHAR(255),
    CONSTRAINT pk_special_dates PRIMARY KEY (id)
);

CREATE TABLE task_allowed_roles
(
    role_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    CONSTRAINT pk_task_allowed_roles PRIMARY KEY (role_id, task_id)
);

CREATE TABLE task_day_of_week
(
    task_id      BIGINT NOT NULL,
    days_of_week VARCHAR(255)
);

CREATE TABLE tasks
(
    id                 BIGINT  NOT NULL,
    name               VARCHAR(255),
    name_abbrev        VARCHAR(255),
    participants_limit INTEGER NOT NULL,
    archived           BOOLEAN NOT NULL,
    role_id            BIGINT,
    CONSTRAINT pk_tasks PRIMARY KEY (id)
);

CREATE TABLE user_roles
(
    role_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (role_id, user_id)
);

CREATE TABLE users
(
    id                    BIGINT                NOT NULL,
    email                 VARCHAR(255),
    password              VARCHAR(255),
    name                  VARCHAR(255),
    surname               VARCHAR(255),
    provider              VARCHAR(255),
    is_enabled            BOOLEAN DEFAULT FALSE NOT NULL,
    failed_login_attempts INTEGER DEFAULT 0     NOT NULL,
    lock_time             TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

ALTER TABLE conflicts
    ADD CONSTRAINT FK_CONFLICTS_ON_TASK1 FOREIGN KEY (task1_id) REFERENCES tasks (id);

ALTER TABLE conflicts
    ADD CONSTRAINT FK_CONFLICTS_ON_TASK2 FOREIGN KEY (task2_id) REFERENCES tasks (id);

ALTER TABLE obstacles
    ADD CONSTRAINT FK_OBSTACLES_ON_RECIPIENT_USER FOREIGN KEY (recipient_user_id) REFERENCES users (id);

ALTER TABLE obstacles
    ADD CONSTRAINT FK_OBSTACLES_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE schedule
    ADD CONSTRAINT FK_SCHEDULE_ON_TASK FOREIGN KEY (task_id) REFERENCES tasks (id);

ALTER TABLE schedule
    ADD CONSTRAINT FK_SCHEDULE_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE tasks
    ADD CONSTRAINT FK_TASKS_ON_ROLE FOREIGN KEY (role_id) REFERENCES roles (id);

ALTER TABLE conflict_day_of_week
    ADD CONSTRAINT fk_conflict_day_of_week_on_conflict FOREIGN KEY (conflict_id) REFERENCES conflicts (id);

ALTER TABLE obstacle_tasks
    ADD CONSTRAINT fk_obstas_on_obstacle FOREIGN KEY (obstacle_id) REFERENCES obstacles (id);

ALTER TABLE obstacle_tasks
    ADD CONSTRAINT fk_obstas_on_task FOREIGN KEY (task_id) REFERENCES tasks (id);

ALTER TABLE task_allowed_roles
    ADD CONSTRAINT fk_tasallrol_on_role FOREIGN KEY (role_id) REFERENCES roles (id);

ALTER TABLE task_allowed_roles
    ADD CONSTRAINT fk_tasallrol_on_task FOREIGN KEY (task_id) REFERENCES tasks (id);

ALTER TABLE task_day_of_week
    ADD CONSTRAINT fk_task_day_of_week_on_task FOREIGN KEY (task_id) REFERENCES tasks (id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_userol_on_role FOREIGN KEY (role_id) REFERENCES roles (id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_userol_on_user FOREIGN KEY (user_id) REFERENCES users (id);