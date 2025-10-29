'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useState, useEffect, useMemo } from "react"

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void
  initialPosition?: [number, number]
}

 //gerencia os cliques no mapa

function MapClickHandler({ 
  onLocationSelect, 
  setMarkerPosition 
}: { 
  onLocationSelect: (lat: number, lng: number) => void
  setMarkerPosition: (pos: [number, number]) => void 
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      setMarkerPosition([lat, lng])
      onLocationSelect(lat, lng)
    },
  })
  return null
}

/**
 * Componente de seleção de localização no mapa.
 * Permite ao usuário clicar no mapa para selecionar coordenadas.
 */
export default function MapSelector({ 
  onLocationSelect, 
  initialPosition = [-15.7801, -47.9292] 
}: MapSelectorProps) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null)

  // Cria ícone customizado usando divIcon com SVG inline
  const customIcon = useMemo(() => 
    L.divIcon({
      className: 'custom-pin-marker',
      html: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
        <defs>
          <filter id="pin-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="rgba(0,0,0,0.4)" />
          </filter>
        </defs>
        <path filter="url(#pin-shadow)"
              d="M12.5,0C5.6,0,0,5.6,0,12.5c0,9.4,12.5,28.5,12.5,28.5S25,21.9,25,12.5C25,5.6,19.4,0,12.5,0z M12.5,18.5c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S15.8,18.5,12.5,18.5z"
              fill="#d32f2f"/>
      </svg>`,
      iconSize: [25, 41],
      iconAnchor: [12.5, 41],
      popupAnchor: [0, -41],
    })
  , [])

  useEffect(() => {
    // Adiciona estilo de cursor clicável
    const style = document.createElement("style")
    style.innerHTML = `
      .leaflet-container {
        cursor: crosshair !important;
      }
      .leaflet-grab {
        cursor: crosshair !important;
      }
      .leaflet-dragging .leaflet-grab {
        cursor: move !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={initialPosition}
        zoom={11}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        className="w-full h-full rounded-lg"
        style={{ cursor: 'crosshair' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://cartodb.com/">CartoDB</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler 
          onLocationSelect={onLocationSelect}
          setMarkerPosition={setMarkerPosition}
        />

        {markerPosition && (
          <Marker position={markerPosition} icon={customIcon} />
        )}
      </MapContainer>

      {/* Instruções para o usuário */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm z-[1000] pointer-events-none">
        {markerPosition 
          ? `Localização: ${markerPosition[0].toFixed(4)}, ${markerPosition[1].toFixed(4)}`
          : "Clique no mapa para selecionar a localização"
        }
      </div>
    </div>
  )
}
