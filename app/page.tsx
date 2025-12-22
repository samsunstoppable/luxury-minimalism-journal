import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FBFBFB]">
      <h1 className="font-serif text-4xl md:text-6xl text-gray-900 mb-6">Journal</h1>
      <p className="text-gray-500 mb-8 tracking-widest uppercase text-sm">Luxury Minimalism</p>
      <Link href="/journal">
        <Button variant="outline" className="px-8 py-6 text-lg">Start Writing</Button>
      </Link>
    </div>
  );
}
