'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "/leaflet/marker-icon.png",
})

interface MapaDepoimentosProps {
  hideMarkers?: boolean
  hideTitle?: boolean
  height?: string // permite customizar altura
}

export default function MapaDepoimentos({ hideMarkers = false, hideTitle = false, height = "100%" }: MapaDepoimentosProps) {
  type Depoimento = {
    id: number
    pos: [number, number]
    cor: string
    texto: string
  }

  const depoimentos: Depoimento[] = [
    {
      id: 1,
      pos: [-15.7801, -47.9292],
      cor: "#ef4444",
      texto: "Fui vítima de assédio em uma parada de ônibus no centro.",
    },
    {
      id: 2,
      pos: [-15.7101, -47.9502],
      cor: "#3b82f6",
      texto: "Tive meu carro arrombado em estacionamento público.",
    },
    {
      id: 3,
      pos: [-15.8601, -47.9002],
      cor: "#22c55e",
      texto: "Fui assaltado à noite, mas recebi apoio rapidamente.",
    },
  ]

  const createIcon = (color: string) =>
    L.divIcon({
      className: "custom-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <span style="
            background:${color};
            width:16px;
            height:16px;
            border-radius:50%;
            box-shadow:0 0 15px ${color};
            animation:pulse 2s infinite;
            display:inline-block;
          "></span>
        </div>
      `,
    })

  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.4); opacity: 0.6; }
      }
    `
    document.head.appendChild(style)
  }, [])

  function EnableZoomOnHover() {
    const map = useMap()

    useEffect(() => {
      const hasScrollHandler = Boolean(map.scrollWheelZoom)
      const container = map.getContainer?.()

      if (!container) return

      const handleEnter = () => {
        try {
          if (hasScrollHandler) map.scrollWheelZoom?.enable()
          map.doubleClickZoom?.enable()
          map.dragging?.enable()
        } catch (error) {
          console.error("Error enabling map interactions:", error)
        }
      }
      const handleLeave = () => {
        try {
          if (hasScrollHandler) map.scrollWheelZoom?.disable()
          map.doubleClickZoom?.disable()
          map.dragging?.disable()
        } catch (error) {
          console.error("Error disabling map interactions:", error)
        }
      }

      container.addEventListener("mouseenter", handleEnter)
      container.addEventListener("mouseleave", handleLeave)

      handleLeave()

      return () => {
        container.removeEventListener("mouseenter", handleEnter)
        container.removeEventListener("mouseleave", handleLeave)
      }
    }, [map])

    return null
  }

  return (
    <div className="w-full" style={{ height }}>
      {!hideTitle && (
        <h2 className="text-3xl font-semibold mb-4 text-center text-white">
          Mapa de Depoimentos
        </h2>
      )}

      <MapContainer
        center={[-15.7801, -47.9292]}
        zoom={10}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        className="w-full h-full rounded-lg"
      >
        <EnableZoomOnHover />

        <TileLayer
          attribution='&copy; <a href="https://cartodb.com/">CartoDB</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {!hideMarkers &&
          depoimentos.map((dep) => (
            <Marker key={dep.id} position={dep.pos} icon={createIcon(dep.cor)}>
              <Popup>
                <p className="text-gray-800 font-medium">{dep.texto}</p>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}
