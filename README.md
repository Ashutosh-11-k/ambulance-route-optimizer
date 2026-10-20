# AI Ambulance Route Optimizer

A web application that manages ambulances, patients, and hospitals and uses a Genetic Algorithm to identify a suitable ambulance-to-patient-to-hospital route based on distance and resource availability.

## Features

- Manage ambulances, patients, and hospitals with CRUD operations.
- Calculate geographic distances using the Haversine formula.
- Generate and evaluate route combinations using a Genetic Algorithm.
- Filter unavailable ambulances and hospitals without emergency capacity.
- Identify the best route and compare alternative routes.
- Visualize locations and routes on an interactive map.

## Tech Stack

**Frontend:** React, Vite, CSS, Leaflet  
**Backend:** Node.js, Express.js  
**Database:** MongoDB Atlas, Mongoose  
**Algorithm:** Genetic Algorithm, Haversine distance calculation

## Project Structure

```text
ambulance-route-optimizer/
├── backend/
│   ├── models/
│   ├── geneticAlgorithm.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance

### 1. Clone the repository

```bash
git clone https://github.com/Ashutosh-11-k/ambulance-route-optimizer.git
cd ambulance-route-optimizer
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with your MongoDB connection string and the port configuration expected by `server.js`.

**Never commit your `.env` file or database credentials.**

Start the backend using the command configured in your backend project. The current development server runs at `http://localhost:5000`.

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Route Optimization

The system considers routes in this order:

**Ambulance → Patient → Hospital**

It calculates the distance from the ambulance to the patient and from the patient to the hospital. The Genetic Algorithm evaluates candidate routes through population creation, fitness calculation, selection, crossover, mutation, and elitism.

Route eligibility also considers ambulance availability and hospital emergency capacity.

## API Testing

The backend exposes REST APIs for managing ambulances, patients, and hospitals, as well as calculating route options and identifying the shortest route.

The backend runs locally at `http://localhost:5000`. See `backend/server.js` for the available endpoints.

## Limitations

- Route distance is calculated from geographic coordinates; it does not necessarily represent actual road distance or live traffic.
- Results depend on the available database records and their coordinates.
- This is an academic project and is not intended to replace real emergency dispatch systems.

## Author

**Ashutosh Kulkarni**

GitHub: [Ashutosh-11-k](https://github.com/Ashutosh-11-k)
