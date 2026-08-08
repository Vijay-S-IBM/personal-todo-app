from datetime import date, timedelta
from fastapi import HTTPException

from src.database.database import DatabaseFunctions
from src.models.tables import (
    GET_RANGE_BY_ID, GET_TASK_SUMMARY,
    GET_STATUS_STATISTICS, GET_TASK_TREND,
)


class StatsService:

    def getStatistics(self, payload, user_id: str):
        try:
            db = DatabaseFunctions()

            # 1. Resolve range name from the provided range_id
            range_data = db.execute_query_with_return(
                GET_RANGE_BY_ID,
                (str(payload.range_id),),
            )
            if not range_data:
                raise HTTPException(status_code=404, detail="Invalid range_id")

            range_name = range_data[0]["range_name"]

            # 2. Calculate start / end dates
            today = date.today()

            if range_name == "Today":
                start_date, end_date = today, today

            elif range_name == "This Week":
                start_date = today - timedelta(days=today.weekday())  # Monday
                end_date = start_date + timedelta(days=6)             # Sunday

            elif range_name == "This Month":
                start_date = today.replace(day=1)
                if today.month == 12:
                    end_date = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
                else:
                    end_date = today.replace(month=today.month + 1, day=1) - timedelta(days=1)

            elif range_name == "Last 6 Month":
                month = today.month - 5
                year = today.year
                if month <= 0:
                    month += 12
                    year -= 1
                start_date = date(year, month, 1)
                end_date = today

            elif range_name == "All":
                start_date = date(1900, 1, 1)
                end_date = date(9999, 12, 31)

            else:
                raise HTTPException(status_code=400, detail=f"Unsupported range: {range_name}")

            # 3. Total task count
            summary = db.execute_query_with_return(
                GET_TASK_SUMMARY,
                (user_id, start_date, end_date),
            )
            total_tasks = int(summary[0]["total_tasks"]) if summary else 0

            # 4. Per-status counts
            status_statistics = db.execute_query_with_return(
                GET_STATUS_STATISTICS,
                (user_id, start_date, end_date),
            )
            # Serialise UUIDs in status rows
            status_statistics = [
                {**dict(r), "status_id": str(r["status_id"]), "task_count": int(r["task_count"])}
                for r in status_statistics
            ]

            # 5. Task trend (date → count)
            task_trend_raw = db.execute_query_with_return(
                GET_TASK_TREND,
                (user_id, start_date, end_date),
            )
            task_trend = [
                {
                    "task_date": row["task_date"].isoformat(),
                    "task_count": int(row["task_count"]),
                }
                for row in task_trend_raw
            ]

            # 6. Derive extra summary fields from status_statistics
            completed_tasks = 0
            in_progress_tasks = 0
            for s in status_statistics:
                name = s["status_name"].lower()
                if name == "completed":
                    completed_tasks = s["task_count"]
                elif name == "in process":
                    in_progress_tasks = s["task_count"]

            pending_tasks = total_tasks - completed_tasks - in_progress_tasks
            completion_percentage = (
                round((completed_tasks / total_tasks) * 100, 2) if total_tasks > 0 else 0
            )

            return {
                "range": {
                    "range_id": str(payload.range_id),
                    "range_name": range_name,
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                },
                "summary": {
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "in_progress_tasks": in_progress_tasks,
                    "pending_tasks": max(pending_tasks, 0),
                    "completion_percentage": completion_percentage,
                },
                "status_statistics": status_statistics,
                "task_trend": task_trend,
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}",
            )
