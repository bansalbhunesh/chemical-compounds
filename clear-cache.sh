#!/bin/bash

echo "====================================================="
echo "  Chemical Compounds Manager - Cache Clearing Guide  "
echo "====================================================="
echo ""
echo "To completely clear the browser cache for this application:"
echo ""
echo "1. Chrome/Brave/Edge:"
echo "   a. Open developer tools (F12 or Ctrl+Shift+I)"
echo "   b. Right-click on the refresh button"
echo "   c. Select 'Empty Cache and Hard Reload'"
echo ""
echo "2. Firefox:"
echo "   a. Press Ctrl+Shift+Delete"
echo "   b. Select 'Cache' only"
echo "   c. Set time range to 'Everything'"
echo "   d. Click 'Clear Now'"
echo ""
echo "3. Safari:"
echo "   a. Enable Developer menu (Preferences > Advanced)"
echo "   b. Select Develop > Empty Caches"
echo ""
echo "====================================================="
echo "Restarting application servers with clean cache..."
echo "====================================================="

# Kill any existing servers
killall node 2>/dev/null

# Clean frontend cache and build
cd frontend
rm -rf node_modules/.cache dist
npm run build

# Start backend
cd ../backend
PORT=3001 npm start &
BACKEND_PID=$!
echo "Backend restarted with PID: $BACKEND_PID"

# Start frontend
cd ../frontend
npx ng serve --port=4300 --disable-host-check &
FRONTEND_PID=$!
echo "Frontend restarted with PID: $FRONTEND_PID"

echo ""
echo "====================================================="
echo "Application restarted with clean cache!"
echo "Frontend: http://localhost:4300"
echo "Backend: http://localhost:3001"
echo "====================================================="
echo "Press Ctrl+C to stop servers"

# Keep process running
wait 