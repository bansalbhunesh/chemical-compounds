#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=====================================================${NC}"
echo -e "${YELLOW}  Restarting Chemical Compounds Manager Application  ${NC}"
echo -e "${YELLOW}=====================================================${NC}"

# Kill any existing node processes
echo -e "${YELLOW}Killing any existing Node.js processes...${NC}"
killall node 2>/dev/null

# Small delay to ensure ports are freed
sleep 2

# Start backend server
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
PORT=3001 DB_TYPE=lowdb npm start &
BACKEND_PID=$!
echo -e "${GREEN}Backend server started with PID: $BACKEND_PID${NC}"

# Wait a moment for backend to initialize
sleep 3

# Start frontend server
echo -e "${GREEN}Starting frontend server...${NC}"
cd ../frontend
npx ng serve --port 4300 --disable-host-check &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend server started with PID: $FRONTEND_PID${NC}"

# Display information
echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}Frontend running at: http://localhost:4300${NC}"
echo -e "${GREEN}Backend API running at: http://localhost:3001${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Trap Ctrl+C and kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID; echo -e '${RED}Servers stopped${NC}'; exit" INT

# Wait for both processes
wait 