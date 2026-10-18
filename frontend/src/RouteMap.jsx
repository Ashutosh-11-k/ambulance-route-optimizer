
import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const ambulanceIcon = new L.DivIcon({
  className: 'custom-map-icon',
  html: '<div class="marker ambulance-marker">A</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const patientIcon = new L.DivIcon({
  className: 'custom-map-icon',
  html: '<div class="marker patient-marker">P</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const hospitalIcon = new L.DivIcon({
  className: 'custom-map-icon',
  html: '<div class="marker hospital-marker">H</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

function getValidPosition(location) {
  if (
    !location ||
    !Number.isFinite(Number(location.latitude)) ||
    !Number.isFinite(Number(location.longitude))
  ) {
    return null
  }

  const latitude = Number(location.latitude)
  const longitude = Number(location.longitude)

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null
  }

  return [latitude, longitude]
}

function FitRoute({ positions }) {
  const map = useMap()

  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [40, 40] })
    }
  }, [map, positions])

  return null
}

function RouteMap({ routeResult }) {
  const [roadRoute, setRoadRoute] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [routeError, setRouteError] = useState('')

  const bestRoute = routeResult?.bestRoute

  const ambulancePosition = getValidPosition(
    bestRoute?.ambulanceLocation,
  )

  const patientPosition = getValidPosition(
    bestRoute?.patientLocation,
  )

  const hospitalPosition = getValidPosition(
    bestRoute?.hospitalLocation,
  )

  const hasValidLocations =
    ambulancePosition &&
    patientPosition &&
    hospitalPosition

  useEffect(() => {
    if (!hasValidLocations) {
      setRoadRoute(null)
      setRouteInfo(null)
      setRouteError('')
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function fetchRoadRoute() {
      setLoading(true)
      setRoadRoute(null)
      setRouteInfo(null)
      setRouteError('')

      try {
        const locations = [
          ambulancePosition,
          patientPosition,
          hospitalPosition,
        ]

        // OSRM expects longitude,latitude order.
        const coordinates = locations
          .map(([latitude, longitude]) => `${longitude},${latitude}`)
          .join(';')

        const url =
          `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
          '?overview=full&geometries=geojson&steps=false'

        const response = await fetch(url, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('The routing service request failed.')
        }

        const data = await response.json()

        if (data.code !== 'Ok' || !data.routes?.length) {
          throw new Error('No driving route was found for these locations.')
        }

        const route = data.routes[0]

        // Leaflet expects latitude,longitude order.
        const roadPositions = route.geometry.coordinates.map(
          ([longitude, latitude]) => [latitude, longitude],
        )

        setRoadRoute(roadPositions)
        setRouteInfo({
          distanceKm: route.distance / 1000,
          durationMinutes: route.duration / 60,
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Road routing error:', error)
          setRouteError(
            'Road routing is temporarily unavailable. Showing straight-line connections instead.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchRoadRoute()

    return () => controller.abort()
  }, [
    routeResult,
    ambulancePosition?.[0],
    ambulancePosition?.[1],
    patientPosition?.[0],
    patientPosition?.[1],
    hospitalPosition?.[0],
    hospitalPosition?.[1],
  ])

  if (!bestRoute) {
    return <p>Optimize a route to display the map.</p>
  }

  if (!hasValidLocations) {
    return (
      <p className="route-warning">
        Map locations are missing or invalid. Please calculate the route again.
      </p>
    )
  }

  const markerPositions = [
    ambulancePosition,
    patientPosition,
    hospitalPosition,
  ]

  const mapPositions = roadRoute ?? markerPositions

  return (
    <>
      <div className="map-legend">
        <span>
          <i className="legend-dot ambulance-dot" /> Ambulance
        </span>
        <span>
          <i className="legend-dot patient-dot" /> Patient
        </span>
        <span>
          <i className="legend-dot hospital-dot" /> Hospital
        </span>
      </div>

      {loading && (
        <p className="route-status">Finding the driving route...</p>
      )}

      {routeError && (
        <p className="route-warning">{routeError}</p>
      )}

      {routeInfo && (
        <div className="road-route-info">
          <div>
            <span>Road Distance</span>
            <strong>{routeInfo.distanceKm.toFixed(2)} km</strong>
          </div>

          <div>
            <span>Estimated Driving Time</span>
            <strong>{Math.round(routeInfo.durationMinutes)} min</strong>
          </div>
        </div>
      )}

      <MapContainer
        center={patientPosition}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitRoute positions={mapPositions} />

        <Marker position={ambulancePosition} icon={ambulanceIcon}>
          <Popup>Ambulance: {bestRoute.ambulanceNumber}</Popup>
        </Marker>

        <Marker position={patientPosition} icon={patientIcon}>
          <Popup>Patient location</Popup>
        </Marker>

        <Marker position={hospitalPosition} icon={hospitalIcon}>
          <Popup>Hospital: {bestRoute.hospitalName}</Popup>
        </Marker>

        <Polyline
          positions={roadRoute ?? markerPositions}
          pathOptions={{
            color: roadRoute ? '#2563eb' : '#dc2626',
            weight: 5,
            opacity: 0.85,
            dashArray: roadRoute ? undefined : '10, 8',
          }}
        />
      </MapContainer>
    </>
  )
}

export default RouteMap
