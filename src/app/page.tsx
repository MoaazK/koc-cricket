import { Hero } from "@/components/ui/Hero";
import { LiveMatches } from "@/components/home/LiveMatches";

export default function Home() {
  return (
    <div className="flex flex-col gap-0">
      <Hero />
      <LiveMatches />
      {/* Additional sections will go here */}
    </div>
  );
}
