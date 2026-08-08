
# Enable UUID generation support (Postgres needs this extension for gen_random_uuid())
CREATE_EXTENSION = """
CREATE EXTENSION IF NOT EXISTS pgcrypto;
"""

CREATE_USERS_TABLE = """
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    picture VARCHAR,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE
);
"""

CREATE_STATUS_TABLE = """
CREATE TABLE IF NOT EXISTS status (
    status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status_name VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE
);
"""

CREATE_DAYS_RANGE_TABLE = """
CREATE TABLE IF NOT EXISTS days_range (
    range_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    range_name VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE
);
"""

CREATE_TASK_DETAILS_TABLE = """
CREATE TABLE IF NOT EXISTS task_details (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    task_name VARCHAR NOT NULL,
    task_description VARCHAR,
    task_comments VARCHAR,
    task_date DATE,
    status_id UUID NOT NULL REFERENCES status(status_id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE
);
"""

CREATE_ERROR_LOGS_TABLE = """
CREATE TABLE IF NOT EXISTS error_logs (
    error_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_file VARCHAR,
    error_function VARCHAR,
    error_message VARCHAR,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE
);
"""

GET_STATUS = """
SELECT * FROM status WHERE is_active = True"""

GET_DATERANGE = """
SELECT * FROM days_range WHERE is_active = True"""

INSERT_STATUS = """
INSERT INTO status (status_name)
VALUES (%s)
ON CONFLICT DO NOTHING;
"""

INSERT_DAYS_RANGE = """
INSERT INTO days_range (range_name)
VALUES (%s)
ON CONFLICT DO NOTHING;
"""

GET_USER = """SELECT user_id, google_id, email, name, picture from users where is_active = True and email = %s"""

CREATE_USER = """
INSERT INTO users (google_id, email, name, picture)
VALUES (%s, %s, %s, %s)
RETURNING user_id, google_id, email, name, picture;"""

GET_USER_BY_ID = """
SELECT user_id, google_id, email, name, picture from users where user_id = %s"""


CREATE_TASK = """
INSERT INTO task_details (
    user_id,
    task_name,
    task_description,
    task_comments,
    task_date,
    status_id
)
VALUES (
    %s, %s, %s, %s, %s,
    (SELECT status_id FROM status WHERE status_name = 'Yet To Start')
)
RETURNING *;
"""

UPDATE_TASK = """
UPDATE task_details
SET
    task_name = %s,
    task_description = %s,
    task_comments = %s,
    task_date = %s,
    updated_at = now()
WHERE task_id = %s
RETURNING *;
"""

UPDATE_TASK_DATE_BULK = """
UPDATE task_details
SET
    task_date = %s,
    updated_at = now()
WHERE task_id = ANY(%s::uuid[])
RETURNING *;
"""

UPDATE_TASK_STATUS = """
UPDATE task_details
SET
    status_id = %s,
    updated_at = now()
WHERE task_id = %s
RETURNING *;
"""

SOFT_DELETE_TASK = """
UPDATE task_details
SET
    is_active = FALSE,
    updated_at = now()
WHERE task_id = %s
RETURNING *;
"""

SOFT_DELETE_TASK_BULK = """
UPDATE task_details
SET
    is_active = FALSE,
    updated_at = now()
WHERE task_id = ANY(%s::uuid[])
RETURNING task_id;
"""

GET_TASK_BY_ID = """
SELECT
    td.task_id,
    td.user_id,
    td.task_name,
    td.task_description,
    td.task_comments,
    td.task_date,
    td.status_id,
    s.status_name,
    td.created_at,
    td.updated_at,
    td.is_active
FROM task_details td
INNER JOIN status s
    ON td.status_id = s.status_id
WHERE td.task_id = %s
  AND td.is_active = TRUE
  AND s.is_active = TRUE;"""


# Returns total count for pagination + filtered rows for a single page
DASHBOARD_DATA = """
    SELECT
        td.task_id,
        td.user_id,
        td.task_name,
        td.task_description,
        td.task_comments,
        td.task_date,
        td.created_at,
        td.updated_at,
        td.is_active,
        s.status_id,
        s.status_name

    FROM task_details td

    JOIN status s
        ON td.status_id = s.status_id

    WHERE td.user_id = %s
      AND td.task_date = %s
      AND td.is_active = TRUE

      AND (
          %s IS NULL
          OR td.task_name ILIKE '%%' || %s || '%%'
      )

      AND (
          %s IS NULL
          OR td.status_id = %s::uuid
      )

    ORDER BY td.created_at DESC
    LIMIT %s OFFSET %s;
"""

DASHBOARD_DATA_COUNT = """
    SELECT COUNT(td.task_id) AS total

    FROM task_details td

    JOIN status s
        ON td.status_id = s.status_id

    WHERE td.user_id = %s
      AND td.task_date = %s
      AND td.is_active = TRUE

      AND (
          %s IS NULL
          OR td.task_name ILIKE '%%' || %s || '%%'
      )

      AND (
          %s IS NULL
          OR td.status_id = %s::uuid
      );
"""


GET_RANGE_BY_ID = """
    SELECT
        range_id,
        range_name
    FROM days_range
    WHERE range_id = %s
      AND is_active = TRUE;
"""


GET_TASK_SUMMARY = """
    SELECT
        COUNT(td.task_id) AS total_tasks
    FROM task_details td
    WHERE td.user_id = %s
      AND td.is_active = TRUE
      AND td.task_date >= %s
      AND td.task_date <= %s;
"""


GET_STATUS_STATISTICS = """
    SELECT
        s.status_id,
        s.status_name,
        COUNT(td.task_id) AS task_count
    FROM task_details td
    JOIN status s
        ON td.status_id = s.status_id
    WHERE td.user_id = %s
      AND td.is_active = TRUE
      AND td.task_date >= %s
      AND td.task_date <= %s
    GROUP BY
        s.status_id,
        s.status_name
    ORDER BY task_count DESC;
"""


GET_TASK_TREND = """
    SELECT
        td.task_date,
        COUNT(td.task_id) AS task_count
    FROM task_details td
    WHERE td.user_id = %s
      AND td.is_active = TRUE
      AND td.task_date >= %s
      AND td.task_date <= %s
    GROUP BY td.task_date
    ORDER BY td.task_date;
"""


GET_STATUS_DROPDOWN = """
SELECT status_id, status_name FROM status WHERE is_active = True"""

GET_DAYS_RANGE_DROPDOWN = """
SELECT range_id, range_name FROM days_range WHERE is_active = True"""


# Calendar: per-day task summary for a full month.
# Returns one row per day that has tasks, with counts broken out by status name.
GET_CALENDAR_MONTH = """
    SELECT
        td.task_date::text                                              AS date,
        COUNT(td.task_id)                                               AS total,
        COUNT(td.task_id) FILTER (WHERE s.status_name = 'Completed')   AS completed,
        COUNT(td.task_id) FILTER (WHERE s.status_name = 'Yet To Start') AS yet_to_start,
        COUNT(td.task_id) FILTER (WHERE s.status_name = 'In Process')  AS in_process,
        COUNT(td.task_id) FILTER (WHERE s.status_name = 'On Hold')     AS on_hold,
        COUNT(td.task_id) FILTER (WHERE s.status_name = 'Delayed')     AS delayed
    FROM task_details td
    JOIN status s
        ON td.status_id = s.status_id
    WHERE td.user_id = %s
      AND td.is_active = TRUE
      AND EXTRACT(YEAR  FROM td.task_date) = %s
      AND EXTRACT(MONTH FROM td.task_date) = %s
    GROUP BY td.task_date
    ORDER BY td.task_date;
"""

# Log an error into the error_logs table
INSERT_ERROR_LOG = """
INSERT INTO error_logs (error_file, error_function, error_message)
VALUES (%s, %s, %s);
"""
