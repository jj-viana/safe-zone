// app/dashboards/page.tsx

import Navbar from "../components/navbar/navbar";
import { Merriweather } from "next/font/google";
import AreaGraficos from "../components/graficoLinha/areagrafico"; //

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["700"],
});


export default function DashboardPage() {
    return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center bg-neutral-900 text-white">
        
        <section className="w-full max-w-[1920px] px-[128px] py-16 flex flex-col gap-6">
          <div className="w-full mt-3">
            <h1 className={`${merriweather.className} text-4xl font-bold mb-3`}>
              Dashboards
            </h1>
            <div className="w-8 h-[3px] bg-cyan-500 mb-5"></div>
          </div>
          <div className="w-full flex flex-row gap-6">
            <div className="w-6/7">
              <AreaGraficos />
            </div>
          </div>
        </section>

      </main>
    </>
  );
}