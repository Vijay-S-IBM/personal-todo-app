# Personal ToDo App — Product Requirements & API Reference

**Version:** 0.2.0  
**Author:** Vijay Suresh  
**Stack:** FastAPI · PostgreSQL · Google OAuth 2.0 · JWT (HS256)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Authentication — Login Screen](#3-authentication--login-screen)
4. [Navbar — Profile Feature](#4-navbar--profile-feature)
5. [Screen 1 — Dashboard](#5-screen-1--dashboard)
6. [Screen 2 — Calendar](#6-screen-2--calendar)
7. [Screen 3 — Statistics](#7-screen-3--statistics)
8. [Utility — Dropdowns](#8-utility--dropdowns)
9. [Complete API Reference](#9-complete-api-reference)
10. [Database Schema](#10-database-schema)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Project Overview

A personal task management application. Log in with Google, manage daily tasks across a calendar, track task statuses, and view analytics across different time ranges. Three main screens: Dashboard, Calendar, Statistics.

---

## 2. Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Backend     | FastAPI (Python)                  |
| Database    | PostgreSQL via psycopg2           |
| Auth        | Google OAuth 2.0 + App JWT (HS256)|
| Validation  | Pydantic v2                       |
| Config      | python-dotenv                     |
| Server      | Uvicorn                           |
| Packages    | uv                                |

---

## 3. Authentication — Login Screen

### What the user sees
- Google Sign-In button
- App logo / name

### What the user can do
- Click "Sign in with Google" — triggers Google OAuth popup
- On success the frontend sends the Google `id_token` to the backend

---

### `POST /auth/google` — Public

Verify Google ID token, upsert the user, and return an application JWT.

**Request body (JSON)**
```json
{
  "id_token": "<google_id_token_string>"
}
```

**Response 200**
```json
{
  "token": "<app_jwt>",
  "user": {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "sub": "<google_sub_id>",
    "email": "vijay@gmail.com",
    "name": "Vijay Suresh",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

**Error responses**
| Code | Reason |
|------|--------|
| 400  | `id_token` is empty |
| 401  | Google token invalid or expired |
| 500  | Unexpected server error |

> Store `token` and `user.user_id` in the frontend. Send the JWT as `Authorization: Bearer <token>` on every subsequent request.

---

## 4. Navbar — Profile Feature

The navbar is visible on all screens after login. The right corner shows the user's Google avatar. Clicking it opens a profile dropdown.

### What the user sees in the dropdown
- Profile picture
- Full name
- Email address
- Logout button

### `GET /me` — Protected

Returns the full profile of the currently logged-in user. The frontend just needs to send the JWT — no `user_id` needed in the URL.

**Headers**
```
Authorization: Bearer <token>
```

**Response 200**
```json
{
  "user": {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "sub": "<google_sub_id>",
    "email": "vijay@gmail.com",
    "name": "Vijay Suresh",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

**Error responses**
| Code | Reason |
|------|--------|
| 401  | Missing / expired / invalid JWT |
| 500  | Unexpected server error |

---

### `GET /get_user_details/{user_id}` — Protected

Fetch profile for any user by their UUID.

**Path param:** `user_id` — UUID  
**Headers:** `Authorization: Bearer <token>`

**Response 200** — same shape as `GET /me`

---

## 5. Screen 1 — Dashboard

Landing page after login. Shows tasks for one selected date with search, filter, pagination and full CRUD.

---

### Navbar links on this screen
- Dashboard (active)
- Statistics
- Calendar
- Profile avatar (top right)

---

### `GET /dashboard` — Protected

Returns paginated tasks for the authenticated user on a specific date.

**Headers:** `Authorization: Bearer <token>`

**Query params**

| Param        | Type    | Required | Default | Description                                      |
|--------------|---------|----------|---------|--------------------------------------------------|
| `task_date`  | date    | ✅       | —       | Format: `YYYY-MM-DD`                             |
| `search`     | string  | ❌       | null    | Filters by task name using case-insensitive LIKE |
| `task_filter`| UUID    | ❌       | null    | Filters by status UUID (from `/dropdown/status`) |
| `page`       | integer | ❌       | 1       | Page number (1-indexed)                          |
| `page_size`  | integer | ❌       | 5       | Number of tasks per page                         |

> `task_filter` is a **status UUID**, not a status name. Get the UUID first from `GET /dropdown/status`.

**Response 200**
```json
{
  "status_code": 200,
  "message": "Task data fetched successfully",
  "data": [
    {
      "task_id": "uuid",
      "user_id": "uuid",
      "task_name": "Fix login bug",
      "task_description": "The token is not persisting",
      "task_comments": "Check localStorage",
      "task_date": "2026-08-08",
      "created_at": "2026-08-08T10:00:00+00:00",
      "updated_at": "2026-08-08T10:00:00+00:00",
      "is_active": true,
      "status_id": "uuid",
      "status_name": "Yet To Start"
    }
  ],
  "total": 12,
  "page": 1,
  "page_size": 5,
  "total_pages": 3
}
```

---

### `POST /add_task` — Protected

Add a new task. The `user_id` is taken from the JWT — not needed in the body.

**Headers:** `Authorization: Bearer <token>`

**Request body (JSON)**
```json
{
  "task_details": {
    "task_name": "Fix login bug",
    "task_description": "The token is not persisting after refresh",
    "task_comments": "Check localStorage implementation",
    "due_date": "2026-08-08"
  }
}
```

| Field              | Type   | Required | Notes                          |
|--------------------|--------|----------|--------------------------------|
| `task_name`        | string | ✅       |                                |
| `task_description` | string | ❌       | null allowed                   |
| `task_comments`    | string | ❌       | null allowed                   |
| `due_date`         | date   | ❌       | Defaults to today (`YYYY-MM-DD`) |

**Response 200**
```json
{
  "status_code": 200,
  "details": "Task added successfully",
  "message": "'Fix login bug' has been added to To-Do!"
}
```

> New tasks always start with status **"Yet To Start"** automatically.

---

### `PATCH /update_task` — Protected

Update task name, description, comments, or due date.

**Headers:** `Authorization: Bearer <token>`

**Request body (JSON)**
```json
{
  "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "task_details": {
    "task_name": "Fix login bug (updated)",
    "task_description": "Updated description",
    "task_comments": "Done — just needed to clear the cache",
    "due_date": "2026-08-09"
  }
}
```

**Response 200**
```json
{
  "status_code": 200,
  "details": "Task updated successfully",
  "message": "Task details have been updated!"
}
```

---

### `PATCH /status_update` — Protected

Change the status of a single task.

**Headers:** `Authorization: Bearer <token>`

**Request body (JSON)**
```json
{
  "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

> Get valid `status_id` values from `GET /dropdown/status`.

**Response 200**
```json
{
  "status_code": 200,
  "details": "Status updated successfully",
  "message": "Task status has been updated!"
}
```

---

### `PATCH /move_task` — Protected

Move one or more tasks to a different due date (bulk supported).

**Headers:** `Authorization: Bearer <token>`

**Request body (JSON)**
```json
{
  "task_ids": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  ],
  "due_date": "2026-08-15"
}
```

**Response 200**
```json
{
  "status_code": 200,
  "details": "Tasks moved successfully",
  "message": "Selected tasks have been moved to the new date!"
}
```

---

### `DELETE /delete_task/{task_id}` — Protected

Soft-delete a single task.

**Headers:** `Authorization: Bearer <token>`  
**Path param:** `task_id` — UUID

**Response 200**
```json
{
  "status_code": 200,
  "details": "Task deleted successfully",
  "message": "Task has been deleted!"
}
```

---

### `DELETE /delete_tasks/bulk` — Protected

Soft-delete multiple tasks at once.

**Headers:** `Authorization: Bearer <token>`

**Request body (JSON)**
```json
{
  "task_ids": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  ]
}
```

**Response 200**
```json
{
  "status_code": 200,
  "details": "Tasks deleted successfully",
  "message": "2 task(s) have been deleted!"
}
```

**Error responses**
| Code | Reason |
|------|--------|
| 400  | `task_ids` list is empty |
| 500  | DB error |

---

### `GET /get_specific_task/{task_id}` — Protected

Fetch all details for a single task (triggered by clicking a task row).

**Headers:** `Authorization: Bearer <token>`  
**Path param:** `task_id` — UUID

**Response 200**
```json
{
  "status_code": 200,
  "message": "Task details fetched successfully",
  "data": {
    "task_id": "uuid",
    "user_id": "uuid",
    "task_name": "Fix login bug",
    "task_description": "The token is not persisting",
    "task_comments": "Check localStorage",
    "task_date": "2026-08-08",
    "status_id": "uuid",
    "status_name": "In Process",
    "created_at": "2026-08-08T10:00:00+00:00",
    "updated_at": "2026-08-08T11:00:00+00:00",
    "is_active": true
  }
}
```

**Error responses**
| Code | Reason |
|------|--------|
| 404  | Task not found or already deleted |
| 500  | DB error |

---

## 6. Screen 2 — Calendar

Full monthly view. Each day cell shows task counts. Clicking a day navigates to the Dashboard for that date.

### `GET /calendar/monthly` — Protected

Returns per-day task summary for an entire month. Days with zero tasks are omitted.

**Headers:** `Authorization: Bearer <token>`

**Query params**

| Param   | Type    | Required | Description         |
|---------|---------|----------|---------------------|
| `year`  | integer | ✅       | 4-digit year, e.g. `2026` |
| `month` | integer | ✅       | 1–12                |

**Response 200**
```json
{
  "status_code": 200,
  "message": "Calendar data fetched successfully",
  "year": 2026,
  "month": 8,
  "days": [
    {
      "date": "2026-08-01",
      "total": 5,
      "completed": 2,
      "yet_to_start": 1,
      "in_process": 1,
      "on_hold": 0,
      "delayed": 1
    },
    {
      "date": "2026-08-08",
      "total": 3,
      "completed": 3,
      "yet_to_start": 0,
      "in_process": 0,
      "on_hold": 0,
      "delayed": 0
    }
  ]
}
```

---

## 7. Screen 3 — Statistics

Visual analytics with summary cards, charts, and a status breakdown.

### Dropdowns on this screen
- **Date range** — Single-select. Options from `GET /dropdown/stats`. Pass the selected `range_id` to the stats API.

### Summary cards
| Card                 | Field in response                      |
|----------------------|----------------------------------------|
| Total Tasks          | `summary.total_tasks`                  |
| Completed Tasks      | `summary.completed_tasks`              |
| In Progress Tasks    | `summary.in_progress_tasks`            |
| Pending Tasks        | `summary.pending_tasks`                |
| Completion %         | `summary.completion_percentage`        |

### Charts
| Chart               | Data source          |
|---------------------|----------------------|
| Donut/Pie by status | `status_statistics`  |
| Bar/Line over time  | `task_trend`         |

---

### `GET /dashboard/statistics` — Protected

**Headers:** `Authorization: Bearer <token>`

**Query params**

| Param      | Type | Required | Description                                       |
|------------|------|----------|---------------------------------------------------|
| `range_id` | UUID | ✅       | UUID from `GET /dropdown/stats` |

**Available ranges**

| Range name     | Date window                       |
|----------------|-----------------------------------|
| Today          | today → today                     |
| This Week      | Monday → Sunday of current week   |
| This Month     | 1st → last day of current month   |
| Last 6 Month   | 6 months ago → today              |
| All            | All time                          |

**Response 200**
```json
{
  "range": {
    "range_id": "uuid",
    "range_name": "This Week",
    "start_date": "2026-08-03",
    "end_date": "2026-08-09"
  },
  "summary": {
    "total_tasks": 42,
    "completed_tasks": 25,
    "in_progress_tasks": 8,
    "pending_tasks": 9,
    "completion_percentage": 59.52
  },
  "status_statistics": [
    { "status_id": "uuid", "status_name": "Completed",    "task_count": 25 },
    { "status_id": "uuid", "status_name": "In Process",   "task_count": 8  },
    { "status_id": "uuid", "status_name": "Yet To Start", "task_count": 5  },
    { "status_id": "uuid", "status_name": "On Hold",      "task_count": 3  },
    { "status_id": "uuid", "status_name": "Delayed",      "task_count": 1  }
  ],
  "task_trend": [
    { "task_date": "2026-08-03", "task_count": 10 },
    { "task_date": "2026-08-04", "task_count": 7  },
    { "task_date": "2026-08-05", "task_count": 12 }
  ]
}
```

---

## 8. Utility — Dropdowns

### `GET /dropdown/{dropdown_type}` — Protected

Populate dropdowns in the UI. Always call this before rendering filter/range selects.

**Headers:** `Authorization: Bearer <token>`  
**Path param:** `dropdown_type` — `"status"` or `"stats"`

**`/dropdown/status` response**
Used in the Dashboard status filter. Pass the `status_id` as `task_filter` in `GET /dashboard`.
```json
[
  { "status_id": "uuid-1", "status_name": "Yet To Start" },
  { "status_id": "uuid-2", "status_name": "In Process"   },
  { "status_id": "uuid-3", "status_name": "Completed"    },
  { "status_id": "uuid-4", "status_name": "On Hold"      },
  { "status_id": "uuid-5", "status_name": "Delayed"      }
]
```

**`/dropdown/stats` response**
Used in the Statistics date range selector. Pass the `range_id` to `GET /dashboard/statistics`.
```json
[
  { "range_id": "uuid-1", "range_name": "Today"        },
  { "range_id": "uuid-2", "range_name": "This Week"    },
  { "range_id": "uuid-3", "range_name": "This Month"   },
  { "range_id": "uuid-4", "range_name": "Last 6 Month" },
  { "range_id": "uuid-5", "range_name": "All"          }
]
```

---

### `GET /healthcheck` — Public

```json
{ "status": 200, "message": "Healthy" }
```

---

## 9. Complete API Reference

| Method   | Endpoint                      | Auth | Screen       | Notes                                  |
|----------|-------------------------------|------|--------------|----------------------------------------|
| GET      | `/healthcheck`                | ❌   | System       | Server health check                    |
| POST     | `/auth/google`                | ❌   | Login        | Google login, returns JWT              |
| GET      | `/me`                         | ✅   | Navbar       | Profile of logged-in user              |
| GET      | `/get_user_details/{user_id}` | ✅   | Navbar       | Profile by UUID                        |
| GET      | `/dashboard`                  | ✅   | Dashboard    | Paginated task list for a date         |
| POST     | `/add_task`                   | ✅   | Dashboard    | Create a new task                      |
| PATCH    | `/update_task`                | ✅   | Dashboard    | Edit task details                      |
| PATCH    | `/status_update`              | ✅   | Dashboard    | Change task status                     |
| PATCH    | `/move_task`                  | ✅   | Dashboard    | Move task(s) to another date (bulk ok) |
| DELETE   | `/delete_task/{task_id}`      | ✅   | Dashboard    | Soft-delete one task                   |
| DELETE   | `/delete_tasks/bulk`          | ✅   | Dashboard    | Soft-delete multiple tasks             |
| GET      | `/get_specific_task/{task_id}`| ✅   | Dashboard    | Full detail view of one task           |
| GET      | `/calendar/monthly`           | ✅   | Calendar     | Per-day task summary for a month       |
| GET      | `/dashboard/statistics`       | ✅   | Statistics   | Summary, charts, trend data            |
| GET      | `/dropdown/{dropdown_type}`   | ✅   | All screens  | `status` or `stats` dropdown options   |

All protected endpoints require: `Authorization: Bearer <token>`

---

## 10. Database Schema

### `users`
| Column     | Type         | Notes                     |
|------------|--------------|---------------------------|
| user_id    | UUID (PK)    | Auto-generated            |
| google_id  | VARCHAR      | Unique, from Google OAuth |
| email      | VARCHAR      | Unique                    |
| name       | VARCHAR      |                           |
| picture    | VARCHAR      | Google avatar URL         |
| created_at | TIMESTAMPTZ  |                           |
| updated_at | TIMESTAMPTZ  |                           |
| is_active  | BOOLEAN      | Soft-delete flag          |

### `status`
| Column      | Type      | Seeded values                                              |
|-------------|-----------|------------------------------------------------------------|
| status_id   | UUID (PK) |                                                            |
| status_name | VARCHAR   | Yet To Start · In Process · Completed · On Hold · Delayed  |
| is_active   | BOOLEAN   |                                                            |

### `days_range`
| Column     | Type      | Seeded values                                              |
|------------|-----------|------------------------------------------------------------|
| range_id   | UUID (PK) |                                                            |
| range_name | VARCHAR   | Today · This Week · This Month · Last 6 Month · All        |
| is_active  | BOOLEAN   |                                                            |

### `task_details`
| Column           | Type         | Notes                                      |
|------------------|--------------|--------------------------------------------|
| task_id          | UUID (PK)    |                                            |
| user_id          | UUID (FK)    | References `users`                         |
| task_name        | VARCHAR      | Required                                   |
| task_description | VARCHAR      | Optional                                   |
| task_comments    | VARCHAR      | Optional                                   |
| task_date        | DATE         | The day the task belongs to                |
| status_id        | UUID (FK)    | References `status`; defaults to "Yet To Start" |
| created_at       | TIMESTAMPTZ  |                                            |
| updated_at       | TIMESTAMPTZ  |                                            |
| is_active        | BOOLEAN      | Soft-delete flag                           |

### `error_logs`
| Column         | Type         | Notes           |
|----------------|--------------|-----------------|
| error_id       | UUID (PK)    |                 |
| error_file     | VARCHAR      |                 |
| error_function | VARCHAR      |                 |
| error_message  | VARCHAR      |                 |
| created_at     | TIMESTAMPTZ  |                 |

---

## 11. Implementation Checklist

### Login
- [x] Google OAuth token verification
- [x] User upsert (create if new, fetch if existing)
- [x] App JWT generation (24h expiry)
- [ ] Logout / token invalidation

### Navbar / Profile
- [x] `GET /me` — returns profile from JWT, no path param needed
- [x] `GET /get_user_details/{user_id}` — fetch by UUID
- [ ] Frontend profile dropdown UI wiring

### Dashboard
- [x] Paginated task list with search + status filter
- [x] Status filter accepts `status_id` UUID (from dropdown)
- [x] Add task (user_id from JWT)
- [x] Edit task details
- [x] Change task status
- [x] Move task(s) to another date (bulk)
- [x] Delete single task
- [x] Bulk delete tasks
- [x] Task detail view

### Calendar
- [x] `GET /calendar/monthly` — per-day counts by status
- [ ] Frontend calendar grid UI
- [ ] Day click → navigate to Dashboard with that date

### Statistics
- [x] Summary cards (total, completed, in_progress, pending, %)
- [x] Status breakdown list
- [x] Task trend by date
- [x] Date range filter via `range_id`
- [ ] Frontend chart rendering (pie, bar, line, progress bar)

### General
- [x] JWT guard on all protected endpoints
- [x] `user_id` sourced from JWT (not request body)
- [x] Pagination on dashboard
- [x] Proper HTTP methods (PATCH for updates, DELETE for deletes)
- [x] Date / UUID serialisation fixed
- [x] Error logs table wired up (`log_error` helper)
- [ ] CORS `allow_origins` — restrict to frontend URL before production
- [ ] Upgrade Python from 3.9 (EOL) to 3.12+
