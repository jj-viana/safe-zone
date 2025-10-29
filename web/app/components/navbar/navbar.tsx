"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react"
import Image from "next/image";
import DenunciaModal from "../denuncia/denuncia"

interface NavbarProps {
  onOpenDenuncia?: () => void;
}

export default function Navbar({ onOpenDenuncia }: NavbarProps) {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false)

  const links = [
    { href: "/", label: "Início" },
    { href: "/sobre", label: "Sobre" },
    { href: "/dashboards", label: "Dashboards" },
  ];

  return (
    <nav className="w-full bg-neutral-900 text-white border-b border-gray-700">
      <div className="flex items-center justify-between py-1 px-[128px] max-w-[1920px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo2.svg"
            alt="SafeZone Logo"
            width={75}
            height={75}
            className="object-contain"
          />
        </Link>

        <div className="flex items-center gap-8">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm md:text-base transition-all duration-200 pb-1 border-b-2 ${
                  active
                    ? "border-cyan-400 text-white font-semibold"
                    : "border-transparent text-gray-300 hover:text-white hover:border-cyan-400"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <button
            onClick={() => {
              onOpenDenuncia?.()
              setShowModal(true)
            }}
            className="text-sm md:text-base pb-1 border-b-2 border-transparent text-gray-300 hover:text-white hover:border-cyan-400 transition-all duration-200 cursor-pointer"
          >
            Fazer Denúncia
          </button>
        </div>
      </div>

      <DenunciaModal show={showModal} onCloseAction={() => setShowModal(false)} />
    </nav>
  );
}
