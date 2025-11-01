'use client'

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useState, useEffect, useMemo } from "react"

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void
  initialPosition?: [number, number]
  selectedPosition?: [number, number] | null
}

// gerencia os cliques no mapa

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


export default function MapSelector({ 
  onLocationSelect, 
  initialPosition = [-15.983774, -47.921338],
  selectedPosition = null,
}: MapSelectorProps) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(selectedPosition)

  const customIcon = useMemo(
    () =>
      L.icon({
        iconUrl: "/marcador.svg",
        iconSize: [25, 41],
        iconAnchor: [12.5, 41],
        popupAnchor: [0, -41],
      }),
    []
  )

  useEffect(() => {
    if (selectedPosition) {
      setMarkerPosition(selectedPosition)
    } else {
      setMarkerPosition(null)
    }
  }, [selectedPosition])

  useEffect(() => {
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

  function MapCenterUpdater({ position }: { position: [number, number] | null }) {
    const map = useMap()

    useEffect(() => {
      if (!position) return
      map.setView(position)
    }, [map, position])

    return null
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={markerPosition ?? initialPosition}
        zoom={11}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        className="w-full h-full rounded-lg"
        style={{ cursor: 'crosshair' }}
      >
        <MapCenterUpdater position={markerPosition ?? null} />
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