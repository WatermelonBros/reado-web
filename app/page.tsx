import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { WorkflowTour } from "@/components/tour/WorkflowTour";
import { Download } from "@/components/Download";
import { Footer } from "@/components/Footer";
import { ScrollToNext } from "@/components/tour/ScrollToNext";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <WorkflowTour />
      <Download />
      <Footer />
      <ScrollToNext />
    </>
  );
}
