
import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import RouteMap from './RouteMap'

function App() {
  const [patientId, setPatientId] = useState('')
  const [routeResult, setRouteResult] = useState(null)
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await axios.get('http://localhost:5000/api/patients')
        setPatients(response.data)
      } catch (error) {
        console.error('Failed to fetch patients:', error)
      }
    }

    fetchPatients()
  }, [])

  async function handleOptimize() {
    if (!patientId.trim()) {
      setErrorMessage('Please select a patient.')
      setRouteResult(null)
      return
    }

    setIsOptimizing(true)
    setErrorMessage('')
    setRouteResult(null)

    try {
      const response = await axios.get(
        `http://localhost:5000/api/routes/options/${patientId.trim()}`
      )

      setRouteResult(response.data)
      console.log(response.data)
    } catch (error) {
      console.error(error)
      setErrorMessage(
        'Could not optimize the route. Please check whether the backend is running and try again.'
      )
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <h2>ResQ Route</h2>
          <p>AMBULANCE OPTIMIZER</p>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard">Dashboard</a>
          <a href="#route-optimizer">Route Optimizer</a>
          <a href="#ambulances">Ambulances</a>
          <a href="#hospitals">Hospitals</a>
          <a href="#patients">Patients</a>
        </nav>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p>Workspace / Dashboard</p>
            <h1>Emergency Response Dashboard</h1>
          </div>
        </header>

        <section className="welcome-section">
          <h2>AI Ambulance Route Optimizer</h2>
          <p>
            Find suitable ambulances and hospitals using Genetic Algorithm
            based route optimization.
          </p>
        </section>

        <section className="overview-grid">
          <article className="overview-card">
            <p>Optimization Engine</p>
            <h3>Genetic Algorithm</h3>
          </article>

          <article className="overview-card">
            <p>Route Sequence</p>
            <h3>Ambulance → Patient → Hospital</h3>
          </article>

          <article className="overview-card">
            <p>Technology</p>
            <h3>MERN Stack</h3>
          </article>
        </section>

        <section className="panel" id="route-optimizer">
          <h2>Route Optimizer</h2>
          <p>Find an eligible ambulance and hospital for a patient.</p>
          
          <label htmlFor="patientId">Select Patient</label>
          <select
            id="patientId"
            value={patientId}
            onChange={(event) => {
              const selectedId = event.target.value
              setPatientId(selectedId)

              const patient = patients.find(
                (item) => item._id === selectedId
              )

              setSelectedPatient(patient || null)
              setRouteResult(null)
            }}
          >
            <option value="">-- Select a patient --</option>

            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name} — Priority {patient.emergencyPriority}/5
              </option>
            ))}
          </select>

          {selectedPatient && (
            <div className="patient-priority">
              <p>
                <strong>Patient:</strong> {selectedPatient.name}
              </p>
              <p>
                <strong>Emergency Priority:</strong>{' '}
                {selectedPatient.emergencyPriority}/5
              </p>
            </div>
          )}

          <button onClick={handleOptimize} disabled={isOptimizing}>
            {isOptimizing ? 'Optimizing Route...' : 'Optimize Route'}
          </button>
          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}
        </section>

        <section className="panel" id="route-map">
          <h2>Route Visualization</h2>
          <p>Ambulance → Patient → Hospital</p>

          <div className="map-container">
            <RouteMap routeResult={routeResult} />
          </div>
        </section>

        <section className="panel results-panel">
          <h2>Optimization Results</h2>

          {routeResult && (
            <div className="optimization-summary">
              <div>
                <span>Candidate Routes</span>
                <strong>{routeResult.totalRoutes}</strong>
              </div>

              <div>
                <span>Generations</span>
                <strong>{routeResult.numberOfGenerations}</strong>
              </div>
            </div>
          )}

          {routeResult ? (
            <>
              <h3>Best Route Found</h3>

              <p>
                <strong>Ambulance:</strong>{' '}
                {routeResult.bestRoute.ambulanceNumber}
              </p>

              <p>
                <strong>Hospital:</strong>{' '}
                {routeResult.bestRoute.hospitalName}
              </p>

              <p>
                <strong>Ambulance to Patient:</strong>{' '}
                {routeResult.bestRoute.route.ambulanceToPatient} km
              </p>

              <p>
                <strong>Patient to Hospital:</strong>{' '}
                {routeResult.bestRoute.route.patientToHospital} km
              </p>

              <div className="total-distance">
                <span>Total Route Distance</span>
                <strong>
                  {routeResult.bestRoute.route.totalDistance} km
                </strong>
              </div>

              <p>
                <strong>Fitness Score:</strong>{' '}
                {routeResult.bestRoute.fitness}
              </p>

              <p>
                <strong>Generations Completed:</strong>{' '}
                {routeResult.numberOfGenerations}
              </p>

              {/* Candidate route comparison table */}
              <h3>All Candidate Routes</h3>

              {routeResult.routes && routeResult.routes.length > 0 ? (
                <div className="routes-table-container">
                  <table className="routes-table">
                    <thead>
                      <tr>
                        <th>Route</th>
                        <th>Ambulance</th>
                        <th>Hospital</th>
                        <th>Distance (km)</th>
                        <th>Fitness</th>
                      </tr>
                    </thead>

                    <tbody>
                      {routeResult.routes.map((route, index) => {
                        const isBestRoute =
                          String(route.ambulance) ===
                            String(routeResult.bestRoute.ambulance) &&
                          String(route.hospital) ===
                            String(routeResult.bestRoute.hospital)

                        return (
                          <tr
                            key={`${route.ambulance}-${route.hospital}-${index}`}
                            className={
                              isBestRoute ? 'best-route-row' : ''
                            }
                          >
                            <td>
                              {index + 1}
                              {isBestRoute ? ' (Best)' : ''}
                            </td>

                            <td>
                              {route.ambulanceNumber || route.ambulance}
                            </td>

                            <td>
                              {route.hospitalName || route.hospital}
                            </td>

                            <td>{route.distance ?? 'N/A'}</td>

                            <td>{route.fitness ?? 'N/A'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No candidate routes available.</p>
              )}
            </>
          ) : (
            <>
              <p>No route calculated yet.</p>
              <p>
                The selected ambulance, hospital, distance and fitness
                details will appear here.
              </p>
            </>
          )}
        </section>

        <footer className="app-footer">
          AI Ambulance Route Optimizer
          <span>Dynamic Route Optimization Using Genetic Algorithm</span>
        </footer>
      </main>
    </div>
  )
}

export default App
