import { useState, useEffect, useCallback } from 'react'
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
  const [ambulances, setAmbulances] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dataErrorMessage, setDataErrorMessage] = useState('')
  const [showAmbulanceForm, setShowAmbulanceForm] = useState(false)

  const [ambulanceForm, setAmbulanceForm] = useState({
    ambulanceNumber: '',
    driverName: '',
    latitude: '',
    longitude: '',
    status: 'available',
  })

  const [ambulanceFormMessage, setAmbulanceFormMessage] = useState('')
  const [isAddingAmbulance, setIsAddingAmbulance] = useState(false)

  const [showHospitalForm, setShowHospitalForm] = useState(false)

  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    availableBeds: '',
    emergencyAvailable: true,
  })

  const [hospitalFormMessage, setHospitalFormMessage] = useState('')
  const [isAddingHospital, setIsAddingHospital] = useState(false)

  const [showPatientForm, setShowPatientForm] = useState(false)

  const [patientForm, setPatientForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    emergencyPriority: '3',
  })

  const [patientFormMessage, setPatientFormMessage] = useState('')
  const [isAddingPatient, setIsAddingPatient] = useState(false)

  const availableAmbulances = ambulances.filter(
    (ambulance) => ambulance.status === 'available'
  ).length

  const availableBeds = hospitals.reduce(
    (total, hospital) => total + (hospital.availableBeds || 0),
    0
  )

  const emergencyHospitals = hospitals.filter(
    (hospital) =>
      hospital.emergencyAvailable && hospital.availableBeds > 0
  ).length

  const selectedAmbulance = routeResult
    ? ambulances.find(
        (item) => item._id === routeResult.bestRoute.ambulance
      )
    : null

  const selectedHospital = routeResult
    ? hospitals.find(
        (item) => item._id === routeResult.bestRoute.hospital
      )
    : null

  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true)
    setDataErrorMessage('')

    try {
      const [patientsResponse, ambulancesResponse, hospitalsResponse] =
        await Promise.all([
          axios.get('http://localhost:5000/api/patients'),
          axios.get('http://localhost:5000/api/ambulances'),
          axios.get('http://localhost:5000/api/hospitals'),
        ])

      const refreshedPatients = patientsResponse.data
      const refreshedAmbulances = ambulancesResponse.data
      const refreshedHospitals = hospitalsResponse.data

      if (
        !Array.isArray(refreshedPatients) ||
        !Array.isArray(refreshedAmbulances) ||
        !Array.isArray(refreshedHospitals)
      ) {
        throw new Error('Unexpected dashboard data format')
      }

      setPatients(refreshedPatients)
      setAmbulances(refreshedAmbulances)
      setHospitals(refreshedHospitals)

      setSelectedPatient((current) =>
        refreshedPatients.find(
          (patient) => patient._id === current?._id
        ) || null
      )

      setPatientId((current) =>
        refreshedPatients.some((patient) => patient._id === current)
          ? current
          : ''
      )

      setRouteResult(null)
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error)
      setDataErrorMessage(
        'Could not load dashboard data. Please check the backend and try again.'
      )
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

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
        error.response?.data?.message ||
          'Could not optimize the route. Please check whether the backend is running and try again.'
      )
    } finally {
      setIsOptimizing(false)
    }
  }

  async function handleAddAmbulance(event) {
    event.preventDefault()

    setIsAddingAmbulance(true)
    setAmbulanceFormMessage('')

    try {
      await axios.post('http://localhost:5000/api/ambulances', {
        ambulanceNumber: ambulanceForm.ambulanceNumber.trim(),
        driverName: ambulanceForm.driverName.trim(),
        currentLocation: {
          latitude: Number(ambulanceForm.latitude),
          longitude: Number(ambulanceForm.longitude),
        },
        status: ambulanceForm.status,
      })

      setAmbulanceFormMessage('Ambulance added successfully!')

      setAmbulanceForm({
        ambulanceNumber: '',
        driverName: '',
        latitude: '',
        longitude: '',
        status: 'available',
      })

      await fetchDashboardData()
      setShowAmbulanceForm(false)
    } catch (error) {
      console.error('Failed to add ambulance:', error)

      setAmbulanceFormMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Could not add ambulance. Please try again.'
      )
    } finally {
      setIsAddingAmbulance(false)
    }
  }

  async function handleAddHospital(event) {
    event.preventDefault()

    setIsAddingHospital(true)
    setHospitalFormMessage('')

    try {
      await axios.post('http://localhost:5000/api/hospitals', {
        name: hospitalForm.name.trim(),
        location: {
          latitude: Number(hospitalForm.latitude),
          longitude: Number(hospitalForm.longitude),
        },
        availableBeds: Number(hospitalForm.availableBeds),
        emergencyAvailable: hospitalForm.emergencyAvailable,
      })

      setHospitalFormMessage('Hospital added successfully!')

      setHospitalForm({
        name: '',
        latitude: '',
        longitude: '',
        availableBeds: '',
        emergencyAvailable: true,
      })

      await fetchDashboardData()
      setShowHospitalForm(false)
    } catch (error) {
      console.error('Failed to add hospital:', error)

      setHospitalFormMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Could not add hospital. Please try again.'
      )
    } finally {
      setIsAddingHospital(false)
    }
  }

  
  async function handleAddPatient(event) {
    event.preventDefault()

    setIsAddingPatient(true)
    setPatientFormMessage('')

    try {
      await axios.post('http://localhost:5000/api/patients', {
        name: patientForm.name.trim(),
        location: {
          latitude: Number(patientForm.latitude),
          longitude: Number(patientForm.longitude),
        },
        emergencyPriority: Number(patientForm.emergencyPriority),
      })

      setPatientFormMessage('Patient added successfully!')

      setPatientForm({
        name: '',
        latitude: '',
        longitude: '',
        emergencyPriority: '3',
      })

      await fetchDashboardData()
      setShowPatientForm(false)
    } catch (error) {
      console.error('Failed to add patient:', error)

      setPatientFormMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Could not add patient. Please try again.'
      )
    } finally {
      setIsAddingPatient(false)
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
          <button
            className="refresh-button"
            onClick={fetchDashboardData}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing Data...' : 'Refresh Data'}
          </button>
        </header>
        {dataErrorMessage && (
          <p className="error-message">{dataErrorMessage}</p>
        )}

        <section className="welcome-section">
          <h2>AI Ambulance Route Optimizer</h2>
          <p>
            Find suitable ambulances and hospitals using Genetic Algorithm
            based route optimization.
          </p>
        </section>

        <section className="overview-grid">
          <article className="overview-card">
            <p>Available Ambulances</p>
            <h3>{availableAmbulances} / {ambulances.length}</h3>
          </article>

          <article className="overview-card">
            <p>Emergency-Ready Hospitals</p>
            <h3>{emergencyHospitals} / {hospitals.length}</h3>
          </article>

          <article className="overview-card">
            <p>Available Hospital Beds</p>
            <h3>{availableBeds}</h3>
          </article>

          <article className="overview-card">
            <p>Total Patients</p>
            <h3>{patients.length}</h3>
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
          {!isRefreshing && !dataErrorMessage && patients.length === 0 && (
            <p>No patients available. Add a patient, then click Refresh Data.</p>
          )}

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

          <button onClick={handleOptimize} disabled={isOptimizing || patients.length === 0}>
            {isOptimizing ? 'Optimizing Route...' : 'Optimize Route'}
          </button>
          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}
        </section>

        <section className="panel" id="ambulances">
          <div className="section-header">
            <h2>Available Ambulances</h2>

            <button
              type="button"
              onClick={() => {
                setShowAmbulanceForm(!showAmbulanceForm)
                setAmbulanceFormMessage('')
              }}
            >
              {showAmbulanceForm ? 'Cancel' : 'Add Ambulance'}
            </button>
          </div>

          {showAmbulanceForm && (
            <form onSubmit={handleAddAmbulance} className="resource-form">
              <label htmlFor="ambulanceNumber">Ambulance Number</label>
              <input
                id="ambulanceNumber"
                value={ambulanceForm.ambulanceNumber}
                onChange={(event) =>
                  setAmbulanceForm({
                    ...ambulanceForm,
                    ambulanceNumber: event.target.value,
                  })
                }
                placeholder="e.g. MH12AB1234"
                required
              />

              <label htmlFor="driverName">Driver Name</label>
              <input
                id="driverName"
                value={ambulanceForm.driverName}
                onChange={(event) =>
                  setAmbulanceForm({
                    ...ambulanceForm,
                    driverName: event.target.value,
                  })
                }
                placeholder="Enter driver name"
                required
              />

              <label htmlFor="ambulanceLatitude">Latitude</label>
              <input
                id="ambulanceLatitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                value={ambulanceForm.latitude}
                onChange={(event) =>
                  setAmbulanceForm({
                    ...ambulanceForm,
                    latitude: event.target.value,
                  })
                }
                placeholder="e.g. 18.5204"
                required
              />

              <label htmlFor="ambulanceLongitude">Longitude</label>
              <input
                id="ambulanceLongitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                value={ambulanceForm.longitude}
                onChange={(event) =>
                  setAmbulanceForm({
                    ...ambulanceForm,
                    longitude: event.target.value,
                  })
                }
                placeholder="e.g. 73.8567"
                required
              />

              <label htmlFor="ambulanceStatus">Status</label>
              <select
                id="ambulanceStatus"
                value={ambulanceForm.status}
                onChange={(event) =>
                  setAmbulanceForm({
                    ...ambulanceForm,
                    status: event.target.value,
                  })
                }
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>

              <button type="submit" disabled={isAddingAmbulance}>
                {isAddingAmbulance ? 'Adding Ambulance...' : 'Save Ambulance'}
              </button>

              {ambulanceFormMessage && (
                <p className="form-message">{ambulanceFormMessage}</p>
              )}
            </form>
          )}

          {ambulances.length === 0 ? (
          <p>No ambulances available.</p>
        ) : (
          <div className="routes-table-container">
            <table className="routes-table">
              <thead>
                <tr>
                  <th>Ambulance Number</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {ambulances.map((ambulance) => (
                  <tr key={ambulance._id}>
                    <td>{ambulance.ambulanceNumber}</td>
                    <td>
                      <span className={`status-badge status-${ambulance.status}`}>
                        {ambulance.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </section>

        <section className="panel" id="hospitals">
          <div className="section-header">
            <h2>Hospitals</h2>

            <button
              type="button"
              onClick={() => {
                setShowHospitalForm(!showHospitalForm)
                setHospitalFormMessage('')
              }}
            >
              {showHospitalForm ? 'Cancel' : 'Add Hospital'}
            </button>
          </div>

          {showHospitalForm && (
            <form onSubmit={handleAddHospital} className="resource-form">
              <label htmlFor="hospitalName">Hospital Name</label>
              <input
                id="hospitalName"
                value={hospitalForm.name}
                onChange={(event) =>
                  setHospitalForm({ ...hospitalForm, name: event.target.value })
                }
                placeholder="Enter hospital name"
                required
              />

              <label htmlFor="hospitalLatitude">Latitude</label>
              <input
                id="hospitalLatitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                value={hospitalForm.latitude}
                onChange={(event) =>
                  setHospitalForm({ ...hospitalForm, latitude: event.target.value })
                }
                placeholder="e.g. 18.5314"
                required
              />

              <label htmlFor="hospitalLongitude">Longitude</label>
              <input
                id="hospitalLongitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                value={hospitalForm.longitude}
                onChange={(event) =>
                  setHospitalForm({ ...hospitalForm, longitude: event.target.value })
                }
                placeholder="e.g. 73.8446"
                required
              />

              <label htmlFor="availableBeds">Available Beds</label>
              <input
                id="availableBeds"
                type="number"
                min="0"
                step="1"
                value={hospitalForm.availableBeds}
                onChange={(event) =>
                  setHospitalForm({ ...hospitalForm, availableBeds: event.target.value })
                }
                placeholder="Enter available beds"
                required
              />

              <label htmlFor="emergencyAvailable">Emergency Services</label>
              <select
                id="emergencyAvailable"
                value={String(hospitalForm.emergencyAvailable)}
                onChange={(event) =>
                  setHospitalForm({
                    ...hospitalForm,
                    emergencyAvailable: event.target.value === 'true',
                  })
                }
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>

              <button type="submit" disabled={isAddingHospital}>
                {isAddingHospital ? 'Adding Hospital...' : 'Save Hospital'}
              </button>

              {hospitalFormMessage && (
                <p className="form-message">{hospitalFormMessage}</p>
              )}
            </form>
          )}

          {hospitals.length === 0 ? (
          <p>No hospitals available.</p>
        ) : (
          <div className="routes-table-container">
            <table className="routes-table">
              <thead>
                <tr>
                  <th>Hospital Name</th>
                  <th>Available Beds</th>
                  <th>Emergency Services</th>
                </tr>
              </thead>

              <tbody>
                {hospitals.map((hospital) => (
                  <tr key={hospital._id}>              
                    <td>{hospital.name}</td>
                    <td>
                      <strong>{hospital.availableBeds}</strong>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          hospital.emergencyAvailable
                            ? 'status-available'
                            : 'status-offline'
                        }`}
                      >
                        {hospital.emergencyAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </section>

        <section className="panel" id="patients">
          <div className="section-header">
            <h2>Patients</h2>

            <button
              type="button"
              onClick={() => {
                setShowPatientForm(!showPatientForm)
                setPatientFormMessage('')
              }}
            >
              {showPatientForm ? 'Cancel' : 'Add Patient'}
            </button>
          </div>

          {showPatientForm && (
            <form onSubmit={handleAddPatient} className="resource-form">
              <label htmlFor="patientName">Patient Name</label>
              <input
                id="patientName"
                value={patientForm.name}
                onChange={(event) =>
                  setPatientForm({ ...patientForm, name: event.target.value })
                }
                placeholder="Enter patient name"
                required
              />

              <label htmlFor="patientLatitude">Latitude</label>
              <input
                id="patientLatitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                value={patientForm.latitude}
                onChange={(event) =>
                  setPatientForm({ ...patientForm, latitude: event.target.value })
                }
                placeholder="e.g. 18.5204"
                required
              />

              <label htmlFor="patientLongitude">Longitude</label>
              <input
                id="patientLongitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                value={patientForm.longitude}
                onChange={(event) =>
                  setPatientForm({ ...patientForm, longitude: event.target.value })
                }
                placeholder="e.g. 73.8567"
                required
              />

              <label htmlFor="emergencyPriority">Emergency Priority (1–5)</label>
              <select
                id="emergencyPriority"
                value={patientForm.emergencyPriority}
                onChange={(event) =>
                  setPatientForm({
                    ...patientForm,
                    emergencyPriority: event.target.value,
                  })
                }
              >
                <option value="1">1 — Lowest</option>
                <option value="2">2 — Low</option>
                <option value="3">3 — Medium</option>
                <option value="4">4 — High</option>
                <option value="5">5 — Highest</option>
              </select>

              <button type="submit" disabled={isAddingPatient}>
                {isAddingPatient ? 'Adding Patient...' : 'Save Patient'}
              </button>

              {patientFormMessage && (
                <p className="form-message">{patientFormMessage}</p>
              )}
            </form>
          )}

          {patients.length === 0 ? (
            <p>No patients available.</p>
          ) : (
            <div className="routes-table-container">
              <table className="routes-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Emergency Priority</th>
                  </tr>
                </thead>

                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient._id}>
                      <td>{patient.name}</td>     
                      <td>
                        <span
                          className={`status-badge ${
                            patient.emergencyPriority >= 5
                              ? 'priority-critical'
                              : patient.emergencyPriority >= 3
                                ? 'priority-high'
                                : 'priority-low'
                          }`}
                        >
                          {patient.emergencyPriority}/5
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          {routeResult && (
            <div className="latest-route-summary">
              <div>
                <span>Selected Ambulance</span>
                <strong>{routeResult.bestRoute.ambulanceNumber}</strong>
              </div>
              <div>
                <span>Selected Hospital</span>
                <strong>{routeResult.bestRoute.hospitalName}</strong>
              </div>
              <div>
                <span>Total Distance</span>
                <strong>{routeResult.bestRoute.route.totalDistance} km</strong>
              </div>
            </div>
          )}
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
              <div className="resource-details-grid">
                <div className="resource-details-card">
                  <h3>Ambulance Details</h3>

                  <p>
                    <strong>Ambulance Number:</strong>{' '}
                    {routeResult.bestRoute.ambulanceNumber}
                  </p>

                  <p>
                    <strong>Location:</strong>{' '}
                    {routeResult.bestRoute.ambulanceLocation.latitude},{' '}
                    {routeResult.bestRoute.ambulanceLocation.longitude}
                  </p>
                  {selectedAmbulance && (
                    <>
                      <p>
                        <strong>Driver:</strong> {selectedAmbulance.driverName}
                      </p>

                      <p>
                        <strong>Status:</strong>{' '}
                        {selectedAmbulance.status}
                      </p>
                    </>
                  )}
                </div>

                <div className="resource-details-card">
                  <h3>Hospital Details</h3>

                  <p>
                    <strong>Hospital Name:</strong>{' '}
                    {routeResult.bestRoute.hospitalName}
                  </p>

                  <p>
                    <strong>Available Coordinates:</strong>{' '}
                    {routeResult.bestRoute.hospitalLocation.latitude},{' '}
                    {routeResult.bestRoute.hospitalLocation.longitude}
                  </p>
                  {selectedHospital && (
                    <>
                      <p>
                        <strong>Available Beds:</strong>{' '}
                        {selectedHospital.availableBeds}
                      </p>

                      <p>
                        <strong>Emergency Services:</strong>{' '}
                        {selectedHospital.emergencyAvailable
                          ? 'Available'
                          : 'Unavailable'}
                      </p>
                    </>
                  )}
                </div>
              </div>

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
