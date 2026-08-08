import psycopg2
from psycopg2.extras import RealDictCursor
from src.core.settings import Settings
from src.models.tables import (
    CREATE_EXTENSION, CREATE_USERS_TABLE, CREATE_STATUS_TABLE,
    CREATE_TASK_DETAILS_TABLE, CREATE_ERROR_LOGS_TABLE,
    CREATE_DAYS_RANGE_TABLE, GET_STATUS, GET_DATERANGE,
    INSERT_STATUS, INSERT_DAYS_RANGE, INSERT_ERROR_LOG,
)


class DatabaseFunctions:

    def __init__(self):
        self.settings = Settings()
        self.statuses = [
            ("Yet To Start",), ("In Process",), ("Completed",),
            ("On Hold",), ("Delayed",),
        ]
        self.day_ranges = [
            ("Today",), ("This Week",), ("This Month",),
            ("Last 6 Month",), ("All",),
        ]

    # ------------------------------------------------------------------
    # Connection
    # ------------------------------------------------------------------

    def database_connection(self):
        try:
            conn = psycopg2.connect(
                self.settings.DATABASE_URL,
                cursor_factory=RealDictCursor,
                connect_timeout=10,
            )
            return conn
        except Exception as e:
            print("Error opening DB connection:", e)
            raise

    # ------------------------------------------------------------------
    # Startup — create tables and seed reference data
    # ------------------------------------------------------------------

    def create_initial_tables(self):
        try:
            ddl_queries = [
                CREATE_EXTENSION,
                CREATE_USERS_TABLE,
                CREATE_STATUS_TABLE,
                CREATE_TASK_DETAILS_TABLE,
                CREATE_ERROR_LOGS_TABLE,
                CREATE_DAYS_RANGE_TABLE,
            ]
            for query in ddl_queries:
                if not self.execute_query_without_return(query):
                    return False

            # Seed reference tables if empty
            for check_query in [GET_STATUS, GET_DATERANGE]:
                if not self.validate_default_values(check_query):
                    return False

            print("All initial tables are ready")
            return True
        except Exception as e:
            print("Error creating initial tables:", e)
            return False

    def validate_default_values(self, query: str):
        try:
            if self.execute_query_with_return(query) == []:
                if query == GET_STATUS:
                    return self.execute_query_without_return(INSERT_STATUS, self.statuses, many=True)
                else:
                    return self.execute_query_without_return(INSERT_DAYS_RANGE, self.day_ranges, many=True)
            return True
        except Exception as e:
            print("Error seeding reference data:", e)
            return False

    # ------------------------------------------------------------------
    # Query helpers
    # ------------------------------------------------------------------

    def execute_query_without_return(self, query: str, values=(), many=False):
        """Run INSERT / UPDATE / DDL where we don't need rows back."""
        conn = None
        try:
            conn = self.database_connection()
            cur = conn.cursor()
            if many:
                cur.executemany(query, values)
            elif values:
                cur.execute(query, values)
            else:
                cur.execute(query)
            conn.commit()
            cur.close()
            return True
        except Exception as e:
            print("Error in execute_query_without_return:", e)
            if conn:
                conn.rollback()
            return False
        finally:
            if conn:
                conn.close()

    def execute_query_with_return(self, query: str, values=()):
        """Run SELECT or INSERT … RETURNING and hand back a list of dicts."""
        conn = None
        try:
            conn = self.database_connection()
            cur = conn.cursor()
            cur.execute(query, values)
            conn.commit()
            rows = [dict(row) for row in cur.fetchall()]
            cur.close()
            return rows
        except Exception as e:
            print("Error in execute_query_with_return:", e)
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                conn.close()

    # ------------------------------------------------------------------
    # Error logging
    # ------------------------------------------------------------------

    def log_error(self, error_file: str, error_function: str, error_message: str):
        """Write an entry to the error_logs table (best-effort, never raises)."""
        try:
            self.execute_query_without_return(
                INSERT_ERROR_LOG,
                (error_file, error_function, error_message),
            )
        except Exception:
            pass   # Logging must never crash the application
