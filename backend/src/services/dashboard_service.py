import math
from fastapi import HTTPException
from src.database.database import DatabaseFunctions
from src.models.tables import DASHBOARD_DATA, DASHBOARD_DATA_COUNT


class DashboardService:

    def getDashboardData(self, payload, user_id: str):
        try:
            db = DatabaseFunctions()

            status_filter = (
                str(payload.task_filter) if payload.task_filter is not None else None
            )

            base_params = (
                user_id,
                payload.task_date,
                payload.search,
                payload.search,
                status_filter,
                status_filter,
            )

            # 1. Get total count for pagination metadata
            count_rows = db.execute_query_with_return(DASHBOARD_DATA_COUNT, base_params)
            total = int(count_rows[0]["total"]) if count_rows else 0

            # 2. Paginate
            page = max(payload.page, 1)
            page_size = max(payload.page_size, 1)
            offset = (page - 1) * page_size
            total_pages = math.ceil(total / page_size) if total > 0 else 1

            data_params = base_params + (page_size, offset)
            rows = db.execute_query_with_return(DASHBOARD_DATA, data_params)

            # Serialise date/uuid fields so FastAPI can JSON-encode them
            serialised = []
            for row in rows:
                r = dict(row)
                if r.get("task_date"):
                    r["task_date"] = r["task_date"].isoformat()
                if r.get("created_at"):
                    r["created_at"] = r["created_at"].isoformat()
                if r.get("updated_at"):
                    r["updated_at"] = r["updated_at"].isoformat()
                for key in ("task_id", "user_id", "status_id"):
                    if r.get(key):
                        r[key] = str(r[key])
                serialised.append(r)

            return {
                "tasks": serialised,
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}",
            )
