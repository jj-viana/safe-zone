"use client";

import Image from "next/image";
import Navbar from "../components/navbar/navbar";
import MemberCard from "../components/memberCard/memberCard";
import { Merriweather } from "next/font/google";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";


const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["700"],
});

export default function SobrePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Normaliza coordenadas (-1 a 1)
    const normalizedX = (x - centerX) / centerX;
    const normalizedY = (y - centerY) / centerY;

    // Limita o valor para evitar exageros
    const clampedX = Math.max(-1, Math.min(1, normalizedX));
    const clampedY = Math.max(-1, Math.min(1, normalizedY));

    // Suaviza o movimento
    const easeOut = (t: number) => 1 - Math.pow(1 - Math.abs(t), 3);
    const easedX = Math.sign(clampedX) * easeOut(clampedX);
    const easedY = Math.sign(clampedY) * easeOut(clampedY);

    // Calcula a rotação (ajustada para suavidade)
    const rotateX = easedY * -8;
    const rotateY = easedX * 8;

    setMousePosition({ x: rotateY, y: rotateX });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePosition({ x: 0, y: 0 });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Normaliza coordenadas (-1 a 1)
    const normalizedX = (x - centerX) / centerX;
    const normalizedY = (y - centerY) / centerY;

    // Limita o valor para evitar exageros
    const clampedX = Math.max(-1, Math.min(1, normalizedX));
    const clampedY = Math.max(-1, Math.min(1, normalizedY));

    // Suaviza o movimento
    const easeOut = (t: number) => 1 - Math.pow(1 - Math.abs(t), 3);
    const easedX = Math.sign(clampedX) * easeOut(clampedX);
    const easedY = Math.sign(clampedY) * easeOut(clampedY);

    // Calcula a rotação (ajustada para suavidade)
    const rotateX = easedY * -8;
    const rotateY = easedX * 8;

    setMousePosition({ x: rotateY, y: rotateX });
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center bg-neutral-900 text-white">
        <section className="w-full max-w-[1920px] px-6 md:px-[128px] py-16 flex flex-col md:flex-row items-start justify-between gap-12">
          {/* Texto lateral esquerdo */}
          <div className="md:w-1/2 mt-3">
            <h1 className={`${merriweather.className} text-4xl font-bold mb-3`}>
              Sobre
            </h1>
            <div className="w-8 h-[3px] bg-cyan-500 mb-5"></div>

            <p className="text-gray-300 leading-relaxed mb-4">
              O <span className="font-semibold">SafeZone</span> é uma plataforma voltada para a análise e visualização de dados
              relacionados a casos criminais.
            </p>

            <p className="text-gray-300 leading-relaxed mb-4">
              Nosso objetivo é transformar informações coletadas por meio de denúncias em dashboards interativos e acessíveis,
              facilitando a compreensão dos cenários de segurança em diferentes regiões.
            </p>

            <p className="text-gray-300 leading-relaxed mb-4">
              Através de formulários de denúncia, reunimos dados que são processados e convertidos em gráficos e mapas.
            </p>

            <p className="text-gray-300 leading-relaxed mb-4">
              Dessa forma, promovemos maior transparência, conscientização social e fornecemos subsídios para a tomada de decisão
              de autoridades, organizações e cidadãos preocupados com a segurança pública.
            </p>

            <p className="text-gray-300 leading-relaxed">
              O SafeZone acredita que a informação é uma ferramenta poderosa para gerar mudanças. Ao dar visibilidade às
              ocorrências criminais, buscamos criar um ambiente mais seguro e colaborativo, onde cada denúncia conta e pode fazer
              a diferença.
            </p>
          </div>

          {/* Mascote com efeito 3D */}
          <motion.div
            className="md:w-1/2 flex justify-center items-end cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              willChange: "transform",
              touchAction: "none",
            }}
          >
            <div className="bg-white rounded-[4rem] p-6 md:p-10 shadow-2xl">
              <Image
                src="/mascote.svg"
                alt="Mascote SafeZone"
                width={300}
                height={300}
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </section>

        <section>
          <MemberCard />
        </section>
      </main>
    </>
  );
}
