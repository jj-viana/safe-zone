'use client'

import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { IoIosArrowRoundDown } from "react-icons/io"
import { FiLock } from "react-icons/fi"
import { useEffect, useState } from "react"
import type { LeafletMouseEvent } from "leaflet"
import ReportModal from "./components/report-modal/report-modal"

const MapaDepoimentos = dynamic(() => import("./components/map/map"), {
  ssr: false,
})

export default function Home() {
  type FloatingLock = {
    size: number
    top: number
    left: number
    delay: number
    speed: number
    opacity: number
    rotation: number
  }

  const [locks, setLocks] = useState<FloatingLock[]>([])
  const [showModal, setShowModal] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    lat: number
    lng: number
    x: number
    y: number
  } | null>(null)
  const [presetLocation, setPresetLocation] = useState<{ lat: number; lng: number } | null>(null)

  function handleMapContextMenu(event: LeafletMouseEvent) {
    const { lat, lng } = event.latlng
    const { x, y } = event.containerPoint
    setContextMenu({ lat, lng, x, y })
  }

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContextMenu(null)
      }
    }

    window.addEventListener("click", handleClick)
    window.addEventListener("keydown", handleKeyPress)

    return () => {
      window.removeEventListener("click", handleClick)
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [])

  useEffect(() => {
    const newLocks: FloatingLock[] = Array.from({ length: 12 }, () => ({
      size: Math.random() * 60 + 60,
      top: Math.random() * 90,
      left: Math.random() * 90,
      delay: Math.random() * 5,
      speed: 10 + Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.25,
      rotation: Math.random() * 360,
    }))
    setLocks(newLocks)
  }, [])

  return (
    <>
      <div className="relative min-h-[100dvh] overflow-x-hidden flex flex-col justify-between text-white bg-neutral-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {locks.map((lock: FloatingLock, index: number) => (
            <motion.div
              key={`lock-${index}`}
              className="absolute text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              style={{
                top: `${lock.top}%`,
                left: `${lock.left}%`,
                fontSize: `${lock.size}px`,
                opacity: lock.opacity,
              }}
              animate={{
                y: [0, -30, 30, 0],
                rotate: [lock.rotation, lock.rotation + 360],
              }}
              transition={{
                duration: lock.speed,
                delay: lock.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FiLock />
            </motion.div>
          ))}
        </div>

        <nav className="relative z-10 w-full flex justify-center pt-6">
          <ul className="flex flex-wrap justify-center gap-6 md:gap-20 text-sm md:text-lg font-medium px-4">
            <li><Link href="/dashboards" className="hover:text-gray-300 transition-colors">Dashboards</Link></li>
            <li>
              <button
                onClick={() => {
                  setContextMenu(null)
                  setPresetLocation(null)
                  setShowModal(true)
                }}
                className="hover:text-gray-300 transition-colors cursor-pointer"
              >
                Fazer Denúncia
              </button>
            </li>
            <li><Link href="/sobre" className="hover:text-gray-300 transition-colors">Sobre</Link></li>
          </ul>
        </nav>

        <div className="relative z-10 flex-1 flex items-center justify-center px-4">
          <Image
            src="/logo.svg"
            alt="Logo SafeZone"
            width={620}
            height={620}
            className="w-[280px] sm:w-[400px] md:w-[620px] h-auto drop-shadow-[0_0_80px_rgba(59,130,246,0.4)]"
            priority
          />
        </div>

        {/* Scroll down */}
        <div className="relative z-10 pb-6 flex flex-col items-center text-gray-400">
          <p className="text-sm">Role para baixo</p>
          <IoIosArrowRoundDown className="text-3xl animate-bounce mt-1" />
        </div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center gap-6 py-20 pb-32 bg-neutral-900">
        <div className="w-[90%] text-center text-white">
          <h2 className="text-2xl md:text-3xl font-semibold">Mapa de Depoimentos</h2>
          <p className="mt-2 text-xs md:text-sm text-gray-300">
            Clique com o botão direito (ou toque longo) no mapa para criar uma denúncia no local desejado.
          </p>
        </div>
        <div className="relative w-[95%] md:w-[90%] h-[500px] md:h-[800px]">
          <div className="h-full rounded-2xl overflow-hidden">
            <MapaDepoimentos hideTitle onContextMenu={handleMapContextMenu} />
          </div>
          {contextMenu && (
            <div
              className="absolute z-[1000] bg-neutral-800 border border-[#24BBE0] rounded-md shadow-lg"
              style={{ top: contextMenu.y, left: contextMenu.x, transform: "translate(-50%, -110%)" }}
              onClick={(event) => event.stopPropagation()}
              onContextMenu={(event) => event.preventDefault()}
            >
              <button
                type="button"
                className="px-4 py-2 text-sm text-white hover:bg-[#24BBE0]/20 whitespace-nowrap text-left"
                onClick={(event) => {
                  event.stopPropagation()
                  if (contextMenu) {
                    setPresetLocation({ lat: contextMenu.lat, lng: contextMenu.lng })
                  }
                  setShowModal(true)
                  setContextMenu(null)
                }}
              >
                Fazer denúncia nesse local
              </button>
            </div>
          )}
          <div className="pointer-events-none absolute bottom-0 right-0 z-[9999] flex flex-row items-center gap-4 md:gap-6 rounded-tl-xl border-t border-l border-[#24BBE0] bg-neutral-900 px-3 py-2 md:px-5 md:py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 md:h-3 md:w-3 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
              <span className="text-xs md:text-sm text-gray-200">Sensação de Insegurança</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 md:h-3 md:w-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
              <span className="text-xs md:text-sm text-gray-200">Crime</span>
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        show={showModal}
        presetLocation={presetLocation}
        onCloseAction={() => {
          setShowModal(false)
          setPresetLocation(null)
        }}
      />
    </>
  )
}
