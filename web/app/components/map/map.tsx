'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useState } from "react"

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
})

interface MapaDepoimentosProps {
  hideMarkers?: boolean
  hideTitle?: boolean
  height?: string // permite customizar altura
}

export default function MapaDepoimentos({ hideMarkers = false, hideTitle = false, height = "100%" }: MapaDepoimentosProps) {
  type ReporterDetails = {
    ageGroup: string | null
    ethnicity: string | null
    genderIdentity: string | null
    sexualOrientation: string | null
  }

  type Depoimento = {
    id: string
    crimeGenre: string
    crimeType: string
    description: string
    location: [number, number]
    crimeDate: string
    reporterDetails: ReporterDetails | null
    createdDate: string
    resolved: boolean
    cor?: string // opcional para definir a cor do marcador
  }

  const [selectedDepoimento, setSelectedDepoimento] = useState<Depoimento | null>(null)

  const depoimentos: Depoimento[] = [
    {
      id: "24daa097-76ba-4622-98a7-cc829841c3e1",
      crimeGenre: "Violência contra a pessoa",
      crimeType: "Assédio sexual",
      description: "Fui vítima de assédio em uma parada de ônibus no centro.",
      location: [-15.7801, -47.9292],
      crimeDate: "2025-10-15T14:30:00Z",
      reporterDetails: {
        ageGroup: "18 - 29",
        ethnicity: "Parda",
        genderIdentity: "Mulher Cisgênero",
        sexualOrientation: "Heterossexual",
      },
      createdDate: "2025-10-15T14:35:00Z",
      resolved: false,
      cor: "#ef4444",
    },
    {
      id: "24daa097-76ba-4622-98a7-cc829841c3e2",
      crimeGenre: "Crime contra o patrimônio",
      crimeType: "Furto de veículo",
      description: "Tive meu carro arrombado em estacionamento público.",
      location: [-15.7101, -47.9502],
      crimeDate: "2025-10-20T09:15:00Z",
      reporterDetails: {
        ageGroup: "30 - 44",
        ethnicity: "Branca",
        genderIdentity: "Homem Cisgênero",
        sexualOrientation: "Heterossexual",
      },
      createdDate: "2025-10-20T10:00:00Z",
      resolved: true,
      cor: "#3b82f6",
    },
    {
      id: "24daa097-76ba-4622-98a7-cc829841c3e3",
      crimeGenre: "Crime contra o patrimônio",
      crimeType: "Roubo",
      description: "Fui assaltado à noite, mas recebi apoio rapidamente.",
      location: [-15.8601, -47.9002],
      crimeDate: "2025-10-25T22:45:00Z",
      reporterDetails: {
        ageGroup: "45 - 59",
        ethnicity: "Negra",
        genderIdentity: "Homem Cisgênero",
        sexualOrientation: null
      },
      createdDate: "2025-10-25T23:00:00Z",
      resolved: true,
      cor: "#22c55e",
    },
    {
      id: "24daa097-76ba-4622-98a7-cc829841c3e4",
      crimeGenre: "Crime",
      crimeType: "Tentativa de assassinato",
      description: "Minha prima foi esfaqueada na minha frente.",
      location: [-15.7101, -47.9002],
      crimeDate: "2025-10-25T22:45:00Z",
      reporterDetails: null,
      createdDate: "2025-10-25T23:00:00Z",
      resolved: true,
      cor: "#22c55e",
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
            <Marker key={dep.id} position={dep.location} icon={createIcon(dep.cor || "#3b82f6")}>
              <Popup>
                <div className="text-gray-800 flex flex-col items-center">
                  <p className="font-medium mb-2 text-center">{dep.description}</p>
                  <button
                    onClick={() => setSelectedDepoimento(dep)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Saiba mais
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Modal de Detalhes */}
      {selectedDepoimento && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4"
          onClick={() => setSelectedDepoimento(null)}
        >
          <div
            className="bg-neutral-900 rounded-2xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border border-[#24BBE0]/30 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão de fechar no canto superior direito */}
            <button
              onClick={() => setSelectedDepoimento(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
            >
              ✕
            </button>

            <div className="mb-6">
              <h3 className="text-3xl font-bold text-white">
                Detalhes do Depoimento
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-[#24BBE0] uppercase mb-2">
                  Descrição
                </h4>
                <p className="text-white">{selectedDepoimento.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-[#24BBE0] uppercase mb-2">
                    Gênero do Crime
                  </h4>
                  <p className="text-white">{selectedDepoimento.crimeGenre}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#24BBE0] uppercase mb-2">
                    Tipo de Crime
                  </h4>
                  <p className="text-white">{selectedDepoimento.crimeType}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#24BBE0] uppercase mb-2">
                    Data do Ocorrido
                  </h4>
                  <p className="text-white">
                    {new Date(selectedDepoimento.crimeDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#24BBE0] uppercase mb-2">
                    Status
                  </h4>
                  <p className="text-white">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedDepoimento.resolved
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-red-500/20 text-red-400 border border-red-500/50'
                      }`}
                    >
                      {selectedDepoimento.resolved ? 'Resolvido' : 'Não resolvido'}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#24BBE0] uppercase mb-2">
                  Informações do Denunciante
                </h4>
                {selectedDepoimento.reporterDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {selectedDepoimento.reporterDetails.ageGroup && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Faixa Etária</p>
                        <p className="text-white">{selectedDepoimento.reporterDetails.ageGroup}</p>
                      </div>
                    )}
                    {selectedDepoimento.reporterDetails.genderIdentity && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Identidade de Gênero</p>
                        <p className="text-white">{selectedDepoimento.reporterDetails.genderIdentity}</p>
                      </div>
                    )}
                    {selectedDepoimento.reporterDetails.sexualOrientation && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Orientação Sexual</p>
                        <p className="text-white">{selectedDepoimento.reporterDetails.sexualOrientation}</p>
                      </div>
                    )}
                    {selectedDepoimento.reporterDetails.ethnicity && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Raça/Cor</p>
                        <p className="text-white">{selectedDepoimento.reporterDetails.ethnicity}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-white">Informações não fornecidas pelo denunciante</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setSelectedDepoimento(null)}
                className="px-8 py-2 bg-[#24BBE0] hover:bg-blue-500 text-white rounded-md transition-colors font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
