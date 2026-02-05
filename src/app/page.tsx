import Navbar from "../components/layout/Navbar"
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import HowItWorks from "../components/home/HowItWorks";
import CTA from "../components/home/CTA";
import Footer from "../components/layout/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
      <SpeedInsights />
    </>
  );
}
