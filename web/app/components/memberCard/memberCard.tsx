"use client";

import Image from "next/image";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function MemberCard() {
  const members = [
    {
      name: "André Belarmino",
      role: "Desenvolvedor Full Stack",
      src: "https://avatars.githubusercontent.com/u/168923024?v=4",
      linkedin: "https://www.linkedin.com/in/andr%C3%A9-belarmino-a62a39355?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      github: "https://github.com/andrehsb",
    },
    {
      name: "Arthur Mendes",
      role: "Desenvolvedor Full Stack",
      src: "https://avatars.githubusercontent.com/u/213681539?v=4",
      linkedin: "https://www.linkedin.com/in/arthur-mendes-borges-956805368/",
      github: "https://github.com/artmendess",
    },
    {
      name: "Bruna Liberal",
      role: "Desenvolvedor Full Stack",
      src: "https://avatars.githubusercontent.com/u/122989435?v=4",
      linkedin: "https://www.linkedin.com/in/bruna-liberal-b1a43628a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      github: "https://github.com/limonadaquente",
    },
    {
      name: "Giovanna Aguiar",
      role: "Desenvolvedor Full Stack",
      src: "https://avatars.githubusercontent.com/u/175221432?v=4",
      linkedin: "https://www.linkedin.com/in/giovanna-aguiar-037428242?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      github: "https://github.com/giovannabrito19",
    },
    {
      name: "Giovanna Felipe",
      role: "Desenvolvedor Full Stack",
      src: "https://avatars.githubusercontent.com/u/172992124?v=4",
      linkedin: "https://www.linkedin.com/in/giovanna-felipe-31m2006?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      github: "https://github.com/giovannafg",
    },
    {
      name: "João Pedro Lopes",
      role: "Desenvolvedor Full Stack",
      src: "https://avatars.githubusercontent.com/u/103763209?v=4",
      linkedin: "https://www.linkedin.com/in/joao-lopes-cruz",
      github: "https://github.com/ojplc",
    },
    {
      name: "Joaquim Viana",
      role: "Desenvolvedor Full Stack",
      src: "https://avatars.githubusercontent.com/u/132113244?v=4",
      linkedin: "https://www.linkedin.com/in/joaquim-jos%C3%A9-da-fonseca-viana-b674a3279/",
      github: "https://github.com/jj-viana",
    },
    {
      name: "Johnnatan Salles",
      role: "Desenvolvedor Full Stack",
      src: "https://avatars.githubusercontent.com/u/169405654?v=4",
      linkedin: "https://www.linkedin.com/in/johnnatan-de-salles-sanches-00287a221/",
      github: "https://github.com/jsalless",
    },
    {
      name: "Luís Felipe Cunha",
      role: "Desenvolvedor Full Stack",
      src: "https://avatars.githubusercontent.com/u/87036806?v=4",
      linkedin: "https://www.linkedin.com/in/lu%C3%ADs-felipe-parreira-cunha-069887306?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      github: "https://github.com/cunha-luiss",
    },
    {
      name: "Matheus Eiki",
      role: "Desenvolvedor Full Stack",
      src: "https://avatars.githubusercontent.com/u/183874678?v=4",
      linkedin: "https://www.linkedin.com/in/matheus-eiki?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      github: "https://github.com/Mateiki",
    },
    {
      name: "Renato Gameiro",
      role: "Desenvolvedor Full Stack",
      src: "https://avatars.githubusercontent.com/u/163028483?v=4",
      linkedin: "https://www.linkedin.com/in/renato-gameiro-38664421a",
      github: "https://github.com/renatoyx",
    },
  ];

  return (
    <section className="w-full py-16 px-[114px] bg-gray-50 dark:bg-[#111]">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-gray-100">
        Equipe de Desenvolvimento
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-items-center">
        {members.map((member, index) => (
          <div key={index} className="group [perspective:1000px]">
            <div
              className="relative bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-xl p-10 flex flex-col items-center text-center
                         transition-transform duration-500 ease-out transform 
                         group-hover:rotate-x-6 group-hover:-rotate-y-6 group-hover:shadow-2xl
                         w-full max-w-[320px] min-w-[280px]"
            >
              <div className="relative w-40 h-40 mb-6">
                <Image
                  src={member.src}
                  alt={member.name}
                  fill
                  className="object-cover rounded-full shadow-md"
                />
              </div>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {member.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {member.role}
              </p>

              <div className="flex gap-4 text-2xl text-gray-600 dark:text-gray-300">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    <FaLinkedin />
                  </a>
                )}
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <FaGithub />
                </a>
              </div>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br from-blue-400/40 to-transparent pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
