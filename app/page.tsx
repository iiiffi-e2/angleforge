import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PricingTable } from "@/components/PricingTable";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
      <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
        Generate <span className="text-primary">Killer Angles</span> <br/> for your content.
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        Stop staring at a blank page. AngleForge uses AI to generate strategic hooks, headlines, and POVs for your marketing campaigns.
      </p>
      <div className="flex gap-4">
        <Link href="/generate">
            <Button size="lg">Generate Your First Angles</Button>
        </Link>
      </div>

      <div className="mt-12 w-full max-w-md text-left">
        <div className="pointer-events-none opacity-80 scale-95 transform rotate-1">
             <div className="border rounded-lg p-6 bg-card shadow-lg space-y-4">
                <div className="flex justify-between">
                    <span className="bg-secondary px-2 py-1 rounded text-xs font-medium">LinkedIn</span>
                    <span className="bg-secondary px-2 py-1 rounded text-xs font-medium">Controversial</span>
                </div>
                <h3 className="font-bold text-lg">The "Anti-Best Practice" Angle</h3>
                <div>
                    <p className="text-xs font-bold text-muted-foreground mb-1">HOOK</p>
                    <p className="text-sm">Stop doing [Common Practice]. It's killing your conversion rate.</p>
                </div>
                 <div>
                    <p className="text-xs font-bold text-muted-foreground mb-1">HEADLINE</p>
                    <p className="text-sm">Why "Best Practices" are actually Average Practices.</p>
                </div>
             </div>
        </div>
      </div>

      <div className="w-full mt-24">
        <PricingTable />
      </div>
    </div>
  );
}
