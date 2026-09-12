import os
import sys
import logging

# Ensure root and backend directories are in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend_dir = os.path.join(root_dir, 'backend')

for path in [backend_dir, root_dir]:
    if os.path.exists(path) and path not in sys.path:
        sys.path.insert(0, path)

from app.main import app



