import WelcomeHeader from "@/components/dashboard/sections/WelcomeHeader"
import AtAGlance from "@/components/dashboard/sections/AtAGlance"
import NextSteps from "@/components/dashboard/sections/NextSteps"
import StrengthsAndGaps from "@/components/dashboard/sections/StrengthsAndGaps"
import RoadmapAndColleges from "@/components/dashboard/sections/RoadmapAndUnis"
import DashboardLayout from "@/components/dashboard/DashboardLayout"

export default function DashboardPage() {
	return (
		<div className='space-y-5 bg-white text-black'>
      		<WelcomeHeader />
      		<AtAGlance />
      		<NextSteps />
      		<StrengthsAndGaps />
     		<RoadmapAndColleges />
		</div>
	)
}
