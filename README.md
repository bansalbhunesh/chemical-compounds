# Chemical Compounds Manager

A web application for managing and viewing chemical compounds.

## Features

- Browse chemical compounds in list or gallery view
- Search for compounds by name and description
- View detailed information about each compound
- Admin users can add, edit, and delete compounds
- Responsive design that works on desktop and mobile devices

## Project Structure

- **Frontend**: Angular 14+ application with Angular Material UI
- **Backend**: Node.js Express API with lowdb for data storage

## Running the Application

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the backend server:
   ```
   PORT=3001 npm start
   ```

The backend server will run on port 3001.

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

The frontend application will run on port 4200. Open your browser and navigate to `http://localhost:4200`.

## Login Credentials

Use the following credentials to log in as an admin:

- **Email**: admin@example.com
- **Password**: Admin1234

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/compounds` - Get all compounds (paginated)
- `GET /api/compounds/:id` - Get a specific compound by ID
- `POST /api/compounds` - Create a new compound (admin only)
- `PUT /api/compounds/:id` - Update a compound (admin only)
- `DELETE /api/compounds/:id` - Delete a compound (admin only)
- `POST /api/auth/login` - Authenticate user

## Modern UI Features

- Apple-inspired design with clean aesthetic
- Smooth animations and transitions
- Responsive layout that adapts to different screen sizes
- Light color scheme with blue accent colors
- Card-based UI with subtle hover effects
- Gallery view for visually browsing compounds