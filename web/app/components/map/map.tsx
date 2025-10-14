"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
})

export default function MapaDepoimentos() {
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

  return (
    <section className="relative min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center py-20">
      <h2 className="text-3xl font-semibold mb-8 text-center">
        Mapa de Depoimentos
      </h2>

      <div className="w-[90%] h-[70vh] rounded-2xl overflow-hidden shadow-lg border border-gray-700">
        <MapContainer
          center={[-15.7801, -47.9292]} // centro em Brasília
          zoom={10}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://cartodb.com/">CartoDB</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {depoimentos.map((dep) => (
            <Marker key={dep.id} position={dep.pos} icon={createIcon(dep.cor)}>
              <Popup>
                <p className="text-gray-800 font-medium">{dep.texto}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  )
}
