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
    from app.main import app as fastapi_app
except Exception as e:
    logging.error(f"Failed to import app.main in Vercel handler: {e}\n{traceback.format_exc()}")
    raise e

class VercelPathMiddleware:
    def __init__(self, inner_app):
        self.inner_app = inner_app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            headers = dict(scope.get("headers", []))
            matched_path = headers.get(b"x-matched-path", b"").decode("utf-8", errors="ignore")
            invoke_path = headers.get(b"x-invoke-path", b"").decode("utf-8", errors="ignore")
            forwarded_uri = headers.get(b"x-forwarded-uri", b"").decode("utf-8", errors="ignore")
            now_route = headers.get(b"x-now-route-matches", b"").decode("utf-8", errors="ignore")

            raw_target = matched_path or invoke_path or forwarded_uri
            if raw_target and raw_target.startswith("/api"):
                target_path = raw_target.split("?")[0]
                scope["path"] = target_path
                scope["raw_path"] = target_path.encode("utf-8")
            elif now_route and "1=" in now_route:
                part = now_route.split("1=")[-1].split("&")[0]
                target_path = "/api/" + part.lstrip("/")
                scope["path"] = target_path
                scope["raw_path"] = target_path.encode("utf-8")

        await self.inner_app(scope, receive, send)

app = VercelPathMiddleware(fastapi_app)


