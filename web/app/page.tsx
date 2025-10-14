'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { IoIosArrowRoundDown } from "react-icons/io"
import { FiLock } from "react-icons/fi"
import { useEffect, useState } from "react"
import MapaDepoimentos from "./components/map/map"
import DenunciaModal from "./components/denuncia/denuncia"

export default function Home() {
  const [locks, setLocks] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const newLocks = [...Array(10)].map(() => ({
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
        {/* Fundo com cadeados */}
        <div className="absolute inset-0 overflow-hidden">
          {locks.map((lock, i) => (
            <motion.div
              key={i}
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

        {/* Navegação */}
        <nav className="relative z-10 w-full flex justify-center pt-6">
          <ul className="flex gap-20 text-lg font-medium">
            <li><Link href="/sobre" className="hover:text-gray-300 transition-colors">Sobre</Link></li>
            <li><Link href="/dashboards" className="hover:text-gray-300 transition-colors">Dashboards</Link></li>
            <li>
              <button
                onClick={() => setShowModal(true)}
                className="hover:text-gray-300 transition-colors"
              >
                Fazer Denúncia
              </button>
            </li>
          </ul>
        </nav>

        {/* Logo */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="Logo SafeZone"
            className="w-[620px] drop-shadow-[0_0_80px_rgba(59,130,246,0.4)]"
          />
        </div>

        {/* Scroll down */}
        <div className="relative z-10 pb-6 flex flex-col items-center text-gray-400">
          <p className="text-sm">Role para baixo</p>
          <IoIosArrowRoundDown className="text-3xl animate-bounce mt-1" />
        </div>
      </div>

      {/* Mapa */}
      <MapaDepoimentos />

      {/* Modal */}
      <DenunciaModal show={showModal} onCloseAction={() => setShowModal(false)} />
    </>
  )
}
