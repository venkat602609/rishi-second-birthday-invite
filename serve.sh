#!/bin/sh

PORT="${1:-8000}"

echo "Serving Rishi's birthday invite at http://localhost:${PORT}"
python3 -m http.server "${PORT}"
