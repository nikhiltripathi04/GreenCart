# GreenCart Logistics - Delivery Simulation & KPI Dashboard

## Project Overview and Purpose

This project develops an internal tool for GreenCart Logistics, a fictional eco-friendly delivery company. The primary purpose of this application is to simulate delivery operations and calculate key performance indicators (KPIs) based on proprietary company rules. This tool enables managers to analyze the impact of various operational parameters, such as staffing levels, delivery schedules, and route allocations, on overall profitability and efficiency.

The application provides a comprehensive interface, including:
* A **Dashboard** for visualizing critical business metrics and simulation results.
* A **Simulation Page** for configuring and executing delivery simulations.
* **Management Pages** offering full CRUD (Create, Read, Update, Delete) capabilities for Drivers, Routes, and Orders.
* A secure **Authentication System** to restrict access to authorized managers.

---

## Tech Stack Used

This application is built using a MERN (MongoDB, Express.js, React, Node.js) stack, leveraging modern development tools and practices.

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Cloud-hosted via MongoDB Atlas)
* **ORM/ODM:** Mongoose
* **Authentication:** JSON Web Tokens (JWT) for secure session management, bcrypt for password hashing.
* **Data Handling:** `csv-parser` for initial data ingestion from CSV files.
* **Environment Variables:** `dotenv` for managing configuration.
* **Testing:** Jest for unit testing backend business logic.

### Frontend
* **Framework:** React (with Hooks)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS for a utility-first, responsive design approach.
* **API Client:** Axios for making HTTP requests to the backend.
* **Charting:** Chart.js integrated with `react-chartjs-2` for data visualization.

### Deployment
* **Backend Hosting:** Render
* **Frontend Hosting:** Vercel
* **Database Hosting:** MongoDB Atlas

---

## Setup Instructions (Local Development)

To set up and run the GreenCart Logistics application on your local machine, follow these steps.

### Prerequisites
* Node.js (v22.12.0 or higher recommended) and npm
* Git
* A MongoDB Atlas account (or a local MongoDB instance running)

### 1. Clone the Repository

Begin by cloning the entire monorepo from GitHub and navigating into the project's root directory:

```bash
git clone [https://github.com/nikhiltripathi04/GreenCart.git](https://github.com/nikhiltripathi04/GreenCart.git)
cd GreenCart
````

### 2\. Backend Setup (`greencart-backend`)

Navigate into the backend project directory:

```bash
cd greencart-backend
```

#### Install Dependencies

Install all required Node.js packages for the backend:

```bash
npm install
```

#### Environment Variables

Create a `.env` file in the `greencart-backend` directory. Populate it with your MongoDB Atlas connection URI and a strong, randomly generated JWT secret.

```dotenv
MONGO_URI="your_mongodb_atlas_connection_string"
JWT_SECRET="your_strong_random_jwt_secret_here"
```

*Note:* Ensure your MongoDB Atlas cluster's Network Access is configured to whitelist your current local IP address, allowing connections from your development environment.

#### Data Ingestion

Place the provided CSV files (`drivers.csv`, `orders.csv`, `routes.csv`) into a `data/` folder within the `greencart-backend` directory. Then, execute the data ingestion script to populate your MongoDB database:

```bash
node ingestData.js
```

#### Start the Backend Server

Start the Express.js backend server. For development, `npm run dev` is recommended for automatic restarts on code changes.

```bash
npm run dev
# Alternatively, for a production-like start:
# npm start
```

The backend API will be accessible locally at `http://localhost:5000`.

### 3\. Frontend Setup (`greencart-frontend`)

Open a **new terminal window or tab**. Navigate back to the root `GreenCart` directory, then proceed into the frontend project directory:

```bash
cd ..
cd greencart-frontend
```

#### Install Dependencies

Install all required React and frontend-specific packages:

```bash
npm install
```

#### Environment Variables

Create a `.env` file in the `greencart-frontend` directory. This variable will point your frontend to the backend API.

```dotenv
VITE_BACKEND_URL="http://localhost:5000/api"
```

This configuration directs your frontend to the local backend API during development.

#### Start the Frontend Development Server

Launch the React development server:

```bash
npm run dev
```

The frontend application will typically be available at `http://localhost:5173/` in your web browser.

-----

## Environment Variables

The following environment variables are essential for the application's operation across different environments. They should be configured in `.env` files locally and within the respective deployment platforms.

  * `MONGO_URI` (Backend: MongoDB Atlas connection string)
  * `JWT_SECRET` (Backend: Secret key for JWT signing and verification)
  * `VITE_BACKEND_URL` (Frontend: URL of the backend API)

-----

## Deployment Instructions

The GreenCart Logistics application is deployed as two distinct services (backend API and frontend client) to cloud hosting platforms.

### Backend Deployment

  * **Platform:** Render
  * **Live URL:** `https://greencart-backend-api.onrender.com`
  * **Configuration Details:** The `greencart-backend` directory of the monorepo is deployed. Render is configured to use `npm install` as the build command and `npm start` as the start command. `MONGO_URI` and `JWT_SECRET` are securely set as environment variables directly on the Render service. MongoDB Atlas's Network Access is configured to allow connections from Render's dynamic IP addresses (set to `0.0.0.0/0` for broad access).

### Frontend Deployment

  * **Platform:** Vercel
  * **Live URL:** `https://greencart-logistics.vercel.app` (Please replace with the actual URL of your Vercel deployment)
  * **Configuration Details:** The `greencart-frontend` directory of the monorepo is deployed. Vercel automatically identifies it as a Vite React application. The `VITE_BACKEND_URL` environment variable is configured on Vercel to `https://greencart-backend-api.onrender.com/api`, ensuring the frontend correctly communicates with the live backend API.

### Database

  * **Platform:** MongoDB Atlas (Cloud-hosted)
  * **Role:** Serves as the persistent data store for all application data, including drivers, routes, orders, and historical simulation results. Its Network Access is configured to allow secure connections from the deployed backend service.

-----

## API Documentation

The backend exposes a RESTful API for managing data and executing simulations. Access to most endpoints requires a JSON Web Token (JWT) provided in the `Authorization: Bearer <token>` header.

### 1\. Authentication APIs

  * **`POST /api/auth/register`**

      * **Description:** Registers a new user account.
      * **Request Body:**
        ```json
        {
          "username": "newuser",
          "password": "securepassword",
          "role": "manager"
        }
        ```
      * **Success Response (201 Created):**
        ```json
        {
          "_id": "60c72b2f9b1d8b001c8e4d5c",
          "username": "newuser",
          "role": "manager",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
        ```

  * **`POST /api/auth/login`**

      * **Description:** Authenticates an existing user and returns a JWT.
      * **Request Body:**
        ```json
        {
          "username": "manager1",
          "password": "password123"
        }
        ```
      * **Success Response (200 OK):**
        ```json
        {
          "_id": "60c72b2f9b1d8b001c8e4d5c",
          "username": "manager1",
          "role": "manager",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
        ```

### 2\. Driver Management APIs (`/api/drivers`)

  * **`GET /api/drivers`**

      * **Description:** Retrieves a list of all registered drivers.
      * **Authentication:** Required (Bearer Token)
      * **Success Response (200 OK):** `[ { _id: "...", name: "Amit", currentShiftHours: 6, past7DayWorkHours: 44, ... }, ... ]`

  * **`POST /api/drivers`**

      * **Description:** Adds a new driver record.
      * **Authentication:** Required (Bearer Token)
      * **Request Body:**
        ```json
        {
          "name": "David Lee",
          "currentShiftHours": 6,
          "past7DayWorkHours": 40
        }
        ```
      * **Success Response (201 Created):** `{ "_id": "60c72b2f9b1d8b001c8e4d5e", "name": "David Lee", "currentShiftHours": 6, "past7DayWorkHours": 40, "__v": 0 }`

  * **`PUT /api/drivers/:id`**

      * **Description:** Updates an existing driver's details by their MongoDB `_id`.
      * **Authentication:** Required (Bearer Token)
      * **Request Body:** (Example, update `name` and `currentShiftHours`)
        ```json
        {
          "name": "David Lee Updated",
          "currentShiftHours": 7
        }
        ```
      * **Success Response (200 OK):** `{ "_id": "...", "name": "David Lee Updated", "currentShiftHours": 7, ... }`

  * **`DELETE /api/drivers/:id`**

      * **Description:** Deletes a driver record by their MongoDB `_id`.
      * **Authentication:** Required (Bearer Token)
      * **Success Response (200 OK):** `{ "message": "Driver removed" }`

### 3\. Route Management APIs (`/api/routes`)

  * **`GET /api/routes`**

      * **Description:** Retrieves a list of all defined routes.
      * **Authentication:** Required (Bearer Token)
      * **Success Response (200 OK):** `[ { _id: "...", routeId: "1", distanceInKm: 25, trafficLevel: "High", baseTime: 125, ... }, ... ]`

  * **`POST /api/routes`**

      * **Description:** Adds a new route.
      * **Authentication:** Required (Bearer Token)
      * **Request Body:**
        ```json
        {
          "routeId": "11",
          "distanceInKm": 18,
          "trafficLevel": "Medium",
          "baseTime": 70
        }
        ```
      * **Success Response (201 Created):** `{ "_id": "60c72b2f9b1d8b001c8e4d5f", "routeId": "11", "distanceInKm": 18, "trafficLevel": "Medium", "baseTime": 70, "__v": 0 }`

  * **`PUT /api/routes/:id`**

      * **Description:** Updates an existing route's details by its MongoDB `_id`.
      * **Authentication:** Required (Bearer Token)
      * **Request Body:** (Example, update `distanceInKm` and `trafficLevel`)
        ```json
        {
          "distanceInKm": 20,
          "trafficLevel": "High"
        }
        ```
      * **Success Response (200 OK):** `{ "_id": "...", "routeId": "11", "distanceInKm": 20, "trafficLevel": "High", ... }`

  * **`DELETE /api/routes/:id`**

      * **Description:** Deletes a route record by its MongoDB `_id`.
      * **Authentication:** Required (Bearer Token)
      * **Success Response (200 OK):** `{ "message": "Route removed" }`

### 4\. Order Management APIs (`/api/orders`)

  * **`GET /api/orders`**

      * **Description:** Retrieves a list of all orders, with `assignedRoute` details populated.
      * **Authentication:** Required (Bearer Token)
      * **Success Response (200 OK):** `[ { _id: "...", orderId: "1", valueRs: 2594, assignedRoute: { _id: "...", routeId: "7", ... }, actualDeliveryDurationMinutes: 127, ... }, ... ]`

  * **`POST /api/orders`**

      * **Description:** Adds a new order record.
      * **Authentication:** Required (Bearer Token)
      * **Request Body:**
        ```json
        {
          "orderId": "ORD001",
          "valueRs": 1500,
          "routeId": "7",
          "actualDeliveryDurationMinutes": 90
        }
        ```
      * **Success Response (201 Created):** `{ "_id": "60c72b2f9b1d8b001c8e4d60", "orderId": "ORD001", "valueRs": 1500, "assignedRoute": { _id: "...", routeId: "7", ... }, "actualDeliveryDurationMinutes": 90, "__v": 0 }`

  * **`PUT /api/orders/:id`**

      * **Description:** Updates an existing order's details by its MongoDB `_id`.
      * **Authentication:** Required (Bearer Token)
      * **Request Body:** (Example, update `valueRs` and `actualDeliveryDurationMinutes`)
        ```json
        {
          "valueRs": 1600,
          "actualDeliveryDurationMinutes": 85
        }
        ```
      * **Success Response (200 OK):** `{ "_id": "...", "orderId": "ORD001", "valueRs": 1600, "actualDeliveryDurationMinutes": 85, ... }`

  * **`DELETE /api/orders/:id`**

      * **Description:** Deletes an order record by its MongoDB `_id`.
      * **Authentication:** Required (Bearer Token)
      * **Success Response (200 OK):** `{ "message": "Order removed" }`

### 5\. Simulation API (`/api/simulation`)

  * **`POST /api/simulation`**

      * **Description:** Runs a delivery simulation based on provided inputs (number of drivers, route start time, max hours per day) and calculates key performance indicators (KPIs). Saves the simulation result to the database.
      * **Authentication:** Required (Bearer Token)
      * **Request Body:**
        ```json
        {
          "numberOfDrivers": 5,
          "routeStartTime": "09:00",
          "maxHoursPerDay": 8
        }
        ```
      * **Success Response (200 OK):**
        ```json
        {
          "totalProfit": 2535,
          "efficiencyScore": 66.67,
          "onTimeDeliveries": 2,
          "totalDeliveries": 3,
          "totalFuelCost": 215,
          "simulationId": "60c72b2f9b1d8b001c8e4d5d",
          "message": "Simulation completed and KPIs calculated successfully."
        }
        ```

  * **`GET /api/simulation/history`**

      * **Description:** Retrieves a chronological list of all past simulation results.
      * **Authentication:** Required (Bearer Token)
      * **Success Response (200 OK):** `[ { _id: "...", timestamp: "2025-08-12T10:30:00.000Z", numberOfDrivers: 5, routeStartTime: "09:00", maxHoursPerDay: 8, totalProfit: 1500, efficiencyScore: 80, onTimeDeliveries: 4, totalDeliveries: 5, totalFuelCost: 100, ... }, ... ]`
