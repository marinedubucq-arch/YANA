'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'

function createVenueIcon(count) {
  if (count > 0) {
    // Green filled circle with count
    const html = `
      <div style="position:relative;width:34px;height:34px;">
        <div style="
          width:34px;height:34px;
          background:#22c55e;
          border-radius:50%;
          border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
        ">
          <span style="color:#fff;font-size:11px;font-weight:700;font-family:Inter,sans-serif;line-height:1;">${count}</span>
        </div>
      </div>
    `
    return L.divIcon({ html, className: 'venue-marker-icon', iconSize: [34, 34], iconAnchor: [17, 17] })
  } else {
    // Black outlined circle, transparent fill
    const html = `
      <div style="
        width:20px;height:20px;
        border-radius:50%;
        border:2px solid #000;
        background:rgba(255,255,255,0.85);
        box-shadow:0 1px 4px rgba(0,0,0,0.18);
      "></div>
    `
    return L.divIcon({ html, className: 'venue-marker-icon', iconSize: [20, 20], iconAnchor: [10, 10] })
  }
}

export default function MapComponent({ venues, onVenueClick, selectedVenueId }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [48.8566, 2.3522],
      zoom: 13,
      zoomControl: true,
    })

    // Light, minimal tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !venues) return

    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}

    venues.forEach(venue => {
      const count = venue.presence?.length || 0
      const icon = createVenueIcon(count)
      const marker = L.marker([venue.lat, venue.lng], { icon })
        .addTo(map)
        .on('click', () => onVenueClick(venue))

      marker.bindTooltip(
        `<strong style="font-family:Inter,sans-serif;font-size:12px;">${venue.name}</strong>${
          count > 0
            ? `<br/><span style="color:#22c55e;font-size:11px;">● ${count} entrepreneur${count > 1 ? 's' : ''} ici</span>`
            : ''
        }`,
        { direction: 'top', offset: [0, -16] }
      )

      markersRef.current[venue.id] = marker
    })
  }, [venues, onVenueClick])

  // Pan to selected venue
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedVenueId) return
    const venue = venues?.find(v => v.id === selectedVenueId)
    if (venue) {
      map.flyTo([venue.lat, venue.lng], 16, { duration: 0.8 })
    }
  }, [selectedVenueId, venues])

  return <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
}
