#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Chemical Compounds Manager Application${NC}"

# Kill any existing Node.js processes
echo -e "${YELLOW}Stopping any existing Node.js processes...${NC}"
killall node 2>/dev/null
sleep 2

# Start backend server
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
npm install dotenv lowdb@1.0.0 uuid express cors jsonwebtoken bcryptjs
PORT=3001 DB_TYPE=lowdb npm start &
BACKEND_PID=$!
echo -e "${GREEN}Backend server started with PID: $BACKEND_PID${NC}"

# Wait a moment for backend to initialize
sleep 3

# Start frontend server
echo -e "${GREEN}Starting frontend server...${NC}"
cd ../frontend
rm -rf node_modules/.cache dist
npm install @angular/cli --save-dev
npx ng serve --port 4300 --disable-host-check &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend server started with PID: $FRONTEND_PID${NC}"

# Display access information
echo -e "${GREEN}=====================================================>${NC}"
echo -e "${GREEN}Application is running!${NC}"
echo -e "${GREEN}Frontend: http://localhost:4300${NC}"
echo -e "${GREEN}Backend API: http://localhost:3001${NC}"
echo -e "${GREEN}=====================================================>${NC}"
echo -e "${YELLOW}Admin credentials:${NC}"
echo -e "${YELLOW}Email: admin@example.com${NC}"
echo -e "${YELLOW}Password: password123${NC}"
echo -e "${GREEN}=====================================================>${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Trap Ctrl+C and kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID; echo -e '${YELLOW}Servers stopped${NC}'; exit" INT

# Wait for both processes
wait 