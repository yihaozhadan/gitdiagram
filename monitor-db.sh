#!/bin/bash

echo "🔍 Monitoring GitDiagram Database Activity"
echo "=========================================="
echo "Database: gitdiagram"
echo "Watching for: INSERT, UPDATE, SELECT operations"
echo "Press Ctrl+C to stop monitoring"
echo ""

# Monitor database logs in real-time
docker logs gitdiagram-db-1 --follow --tail 0 | while read line; do
    # Filter for relevant database operations
    if [[ "$line" == *"INSERT"* ]] || [[ "$line" == *"UPDATE"* ]] || [[ "$line" == *"SELECT"* ]] || [[ "$line" == *"gitdiagram_diagram_cache"* ]]; then
        timestamp=$(date '+%H:%M:%S')
        echo "[$timestamp] 📊 $line"
    elif [[ "$line" == *"ERROR"* ]] || [[ "$line" == *"FATAL"* ]]; then
        timestamp=$(date '+%H:%M:%S')
        echo "[$timestamp] ❌ $line"
    elif [[ "$line" == *"connection"* ]]; then
        timestamp=$(date '+%H:%M:%S')
        echo "[$timestamp] 🔌 $line"
    fi
done
