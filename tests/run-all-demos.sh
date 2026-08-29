#!/bin/bash
cd /home/daytona/codebase
rm -rf test-results/screenshots
mkdir -p test-results/screenshots

echo "=== Running all demo tests ==="
npx playwright test tests/demo-videos.spec.ts --reporter=list 2>&1

echo ""
echo "=== Screenshots captured ==="
ls -lh test-results/screenshots/ 2>/dev/null || echo "No screenshots found"
