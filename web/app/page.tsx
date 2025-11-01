'use client'

import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { IoIosArrowRoundDown } from "react-icons/io"
import { FiLock } from "react-icons/fi"
import { useCallback, useEffect, useState } from "react"
import type { LeafletMouseEvent } from "leaflet"
import DenunciaModal from "./components/denuncia/denuncia"

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

  const handleMapContextMenu = useCallback((event: LeafletMouseEvent) => {
    const { lat, lng } = event.latlng
    const { x, y } = event.containerPoint
    setContextMenu({ lat, lng, x, y })
  }, [])

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
      <div className="relative min-h-screen overflow-hidden flex flex-col justify-between text-white bg-neutral-900">
        <div className="absolute inset-0 overflow-hidden">
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
          <ul className="flex gap-20 text-lg font-medium">
            <li><Link href="/sobre" className="hover:text-gray-300 transition-colors">Sobre</Link></li>
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
          </ul>
        </nav>

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <Image
            src="/logo.svg"
            alt="Logo SafeZone"
            width={620}
            height={620}
            className="w-[620px] h-auto drop-shadow-[0_0_80px_rgba(59,130,246,0.4)]"
            priority
          />
        </div>

        {/* Scroll down */}
        <div className="relative z-10 pb-6 flex flex-col items-center text-gray-400">
          <p className="text-sm">Role para baixo</p>
          <IoIosArrowRoundDown className="text-3xl animate-bounce mt-1" />
        </div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center gap-6 py-20 bg-neutral-900">
        <div className="w-[90%] text-center text-white">
          <h2 className="text-3xl font-semibold">Mapa de Depoimentos</h2>
          <p className="mt-2 text-sm text-gray-300">
            Clique com o botão direito no mapa para criar uma denúncia no local desejado.
          </p>
        </div>
        <div className="relative w-[90%] h-[500px]">
          <div className="h-full rounded-2xl overflow-hidden">
            <MapaDepoimentos hideTitle height="200%" onContextMenu={handleMapContextMenu} />
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
        </div>
      </div>

      <DenunciaModal
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
