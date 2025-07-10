import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GridBackgroundDemo } from "@/components/GridBackground";
import { CreateRoom } from "@/components/CreateRoom";
import { JoinRoom } from "@/components/JoinRoom";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center">
          <div className="rounded-md p-2">
            <Image src="/playback-removebg-preview.png" alt="Playback Logo" width={24} height={24} />
          </div>
          <span className="font-semibold text-xl text-[#18382c]">Playback</span>
        </div>
        <div className="flex gap-3">
          <a href="https://rishiakkina.notion.site/Portfolio-1ef7c5483f2e8011a749dde2d11ecea7" target="_blank"><Button variant="outline" className="px-5 py-2 font-medium">About Me</Button></a>
          <Button className="px-5 py-2 font-medium">Contact Me</Button>
        </div>
      </header>

      {/* Hero Section */}
      <GridBackgroundDemo>
      <div className="relative flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#18382c] leading-tight max-w-3xl mx-auto">
          One place to <span className="bg-[#e6f36a] px-2 rounded">Enjoy</span> Sports & movies together
        </h1>
        <p className="mt-6 text-lg text-[#4b6358] max-w-xl mx-auto">
          Playback helps users create virtual rooms to watch sports and movies with their friends and fans.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">     
          <CreateRoom />
          <JoinRoom />
        </div>
      </div>
      </GridBackgroundDemo>

      {/* Partners Section */}
      <section className="mt-20 pb-10 flex flex-col items-center">
        <span className="text-sm text-[#4b6358] mb-4">More than 5+ platforms supported</span>
        <div className="flex flex-wrap gap-8 justify-center items-center opacity-80">
        </div>
      </section>
    </div>
  );
}
