import Navbar from "../components/navbar/navbar";
import GraficodeBarras from "../components/graficoBarras/graficoBarras"
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["700"],
});

export default function DashboardPage() {
    return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center bg-neutral-900 text-white">
        <section className="w-full max-w-[1920px] px-[128px] py-16 flex flex-col md:flex-row items-start justify-between gap-12">
          {/* Texto lateral esquerdo */}
          <div className="md:w-1/2 mt-3">
            <h1 className={`${merriweather.className} text-4xl font-bold mb-3`}>
              Dashboards
            </h1>
            <div className="w-8 h-[3px] bg-cyan-500 mb-5"></div>
          </div>
        </section>
        <GraficodeBarras></GraficodeBarras>
      </main>
    </>
  );
}

