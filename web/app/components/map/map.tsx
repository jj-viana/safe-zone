'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import type { LeafletMouseEvent } from "leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useState } from "react"
import { reportsClient } from "@/lib/api/reports-client"
import type { ReportResponse, ReporterDetailsResponse } from "@/lib/api/types"

const parseLocation = (location: ReportResponse['location']): [number, number] | null => {
  if (!location) return null

  const matches = location.match(/-?\d+(?:\.\d+)?/g)
  if (!matches || matches.length < 2) return null

  const lat = Number.parseFloat(matches[0])
  const lng = Number.parseFloat(matches[1])

  const isValidLatitude = Number.isFinite(lat) && lat >= -90 && lat <= 90
  const isValidLongitude = Number.isFinite(lng) && lng >= -180 && lng <= 180

  if (!isValidLatitude || !isValidLongitude) return null

  return [lat, lng]
}

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "/leaflet/marker-icon.png",
})

const DEFAULT_CENTER: [number, number] = [-15.824162,-47.929301]

interface MapaDepoimentosProps {
  hideMarkers?: boolean
  hideTitle?: boolean
  height?: string // permite customizar altura
  onContextMenu?: (event: LeafletMouseEvent) => void
}

export default function MapaDepoimentos({ hideMarkers = false, hideTitle = false, height = "100%", onContextMenu }: MapaDepoimentosProps) {
  type Depoimento = {
    id: string
    crimeGenre: string
    crimeType: string
    description: string
    location: [number, number]
    region: string
    crimeDate: string
    reporterDetails: ReporterDetailsResponse | null
    createdDate: string
    resolved: boolean
    status: string
    cor?: string
  }

  const [selectedDepoimento, setSelectedDepoimento] = useState<Depoimento | null>(null)
  const [reports, setReports] = useState<Depoimento[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadReports = async () => {
      setIsLoading(true)
      try {
        const data = await reportsClient.getAllReports('Approved')
        if (!isMounted) return

        const mapped = data.reduce<Depoimento[]>((acc, report) => {
          const coords = parseLocation(report.location)
          if (!coords) {
            console.warn("MapaDepoimentos: localização inválida para denúncia", report.id, report.location)
            return acc
          }

          acc.push({
            id: report.id,
            crimeGenre: report.crimeGenre,
            crimeType: report.crimeType,
            description: report.description,
            location: coords,
            region: report.region,
            crimeDate: report.crimeDate,
            reporterDetails: report.reporterDetails ?? null,
            createdDate: report.createdDate,
            status: report.status,
            resolved: report.resolved,
          })

          return acc
        }, [])

        setReports(mapped)
        setFetchError(null)
        setSelectedDepoimento((current) => {
          if (!current) return null
          return mapped.find((item) => item.id === current.id) ?? null
        })
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : "Erro ao carregar denúncias"
        setFetchError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadReports()

    return () => {
      isMounted = false
    }
  }, [])

  /**
   * Define a cor do marcador baseado no gênero do crime
   * @param crimeGenre - Gênero do crime
   * @returns Cor em formato hexadecimal
   */
  const getMarkerColor = (crimeGenre: string): string => {
    if (crimeGenre === "Crime") {
      return "#ef4444"
    } else if (crimeGenre === "Sensação de insegurança") {
      return "#3b82f6"
    }
    return "#22c55e"
  }

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

  const getStatusBadgeClass = (status: string): string => {
    const normalized = status.trim().toLowerCase()
    if (normalized === "approved") {
      return "bg-green-500/20 text-green-400 border border-green-500/50"
    }

    if (normalized === "draft") {
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
    }

    if (normalized === "rejected") {
      return "bg-red-500/20 text-red-400 border border-red-500/50"
    }

    return "bg-blue-500/20 text-blue-400 border border-blue-500/50"
  }

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

      if (container.matches(":hover")) {
        handleEnter()
      } else {
        handleLeave()
      }

      return () => {
        container.removeEventListener("mouseenter", handleEnter)
        container.removeEventListener("mouseleave", handleLeave)
      }
    }, [map])

    return null
  }

  function ContextMenuHandler({ handler }: { handler?: (event: LeafletMouseEvent) => void }) {
    const map = useMap()

    useEffect(() => {
      if (!handler) return

      const handleContextMenu = (event: LeafletMouseEvent) => {
        event.originalEvent.preventDefault()
        if (event.originalEvent.stopPropagation) {
          event.originalEvent.stopPropagation()
        }
        handler(event)
      }

      map.on("contextmenu", handleContextMenu)

      return () => {
        map.off("contextmenu", handleContextMenu)
      }
    }, [map, handler])

    return null
  }

  function ResizeAndCenterHandler({ center }: { center: [number, number] }) {
    const map = useMap()

    useEffect(() => {
      const ensureSizeAndCenter = () => {
        const currentCenter = map.getCenter()
        const currentZoom = map.getZoom()
        map.invalidateSize()
        map.setView(currentCenter, currentZoom, { animate: false })
      }

      const frame = requestAnimationFrame(ensureSizeAndCenter)

      const handleResize = () => {
        const currentCenter = map.getCenter()
        const currentZoom = map.getZoom()
        map.invalidateSize()
        map.setView(currentCenter, currentZoom, { animate: false })
      }

      window.addEventListener("resize", handleResize)

      return () => {
        cancelAnimationFrame(frame)
        window.removeEventListener("resize", handleResize)
      }
    }, [map, center])

    return null
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {!hideTitle && (
        <div className="mb-4 text-center text-white">
          <h2 className="text-3xl font-semibold">
            Mapa de Depoimentos
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Clique com o botão direito no mapa para criar uma denúncia no local desejado.
          </p>
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={11}
        className="w-full h-full rounded-lg"
      >
        <EnableZoomOnHover />
        <ContextMenuHandler handler={onContextMenu} />
        <ResizeAndCenterHandler center={DEFAULT_CENTER} />

        <TileLayer
          attribution='&copy; <a href="https://cartodb.com/">CartoDB</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {!hideMarkers &&
          reports.map((dep) => (
            <Marker key={dep.id} position={dep.location} icon={createIcon(dep.cor || getMarkerColor(dep.crimeGenre))}>
              <Popup>
                <div className="text-gray-800 flex flex-col items-center">
                  <p className="font-medium mb-2 text-center">{dep.description}</p>
                  <button
                    onClick={() => setSelectedDepoimento(dep)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    aria-label={`Saiba mais`}
                  >
                    Saiba mais
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {isLoading && (
        <div className="absolute inset-0 z-[1100] flex flex-col items-center justify-center gap-4 bg-black/40">
          <span className="sr-only">Carregando denúncias...</span>
          <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-[#24BBE0] animate-spin" />
          <p className="text-sm font-medium text-white/80">Carregando denúncias...</p>
        </div>
      )}

      {!hideMarkers && fetchError && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] flex -translate-x-1/2 justify-center">
          <span className="rounded bg-red-600/80 px-4 py-2 text-sm text-white shadow-lg">
            Não foi possível carregar as denúncias.
          </span>
        </div>
      )}

      {!hideMarkers && !fetchError && !isLoading && reports.length === 0 && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] flex -translate-x-1/2 justify-center">
          <span className="rounded bg-black/60 px-4 py-2 text-sm text-white shadow-lg">
            Nenhuma denúncia encontrada.
          </span>
        </div>
      )}

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
              aria-label="Fechar"
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
                    Região
                  </h4>
                  <p className="text-white">{selectedDepoimento.region}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#24BBE0] uppercase mb-2">
                    Data do Ocorrido
                  </h4>
                  <p className="text-white">
                    {new Date(selectedDepoimento.crimeDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-[#24BBE0] uppercase mb-2">
                    Status
                  </h4>
                  <div className="flex flex-wrap gap-2 text-white">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedDepoimento.status)}`}
                    >
                      {selectedDepoimento.status}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedDepoimento.resolved
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-red-500/20 text-red-400 border border-red-500/50'
                      }`}
                    >
                      {selectedDepoimento.resolved ? 'Resolvido' : 'Não resolvido'}
                    </span>
                  </div>
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
