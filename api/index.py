import os
import sys
import logging

# Ensure root and backend directories are in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend_dir = os.path.join(root_dir, 'backend')

for path in [backend_dir, root_dir]:
    if os.path.exists(path) and path not in sys.path:
        sys.path.insert(0, path)

import traceback

try:
    from app.main import app
except Exception as e:
    import_err = str(e)
    import_tb = traceback.format_exc()
    logging.error(f"Failed to import app.main in Vercel handler: {import_err}\n{import_tb}")
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse

    app = FastAPI(title="CineBook Fallback API")

    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    async def fallback_catchall(request: Request, full_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to import CineBook app.main",
                "detail": import_err,
                "traceback": import_tb,
                "cwd": os.getcwd(),
                "sys_path": sys.path,
                "path": full_path
            }
        )



