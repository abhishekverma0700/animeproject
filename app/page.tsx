import dynamic from "next/dynamic";
import Hero from "@/components/Hero";

// Lazy-load every below-the-fold section with next/dynamic to optimize initial TBT & hydration
const Projects = dynamic(() => import("@/components/Projects"), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#F5F3EE]" />,
});

const About = dynamic(() => import("@/components/About"), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#F5F3EE]" />,
});

const Skills = dynamic(() => import("@/components/Skills"), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#F5F3EE]" />,
});

const ProofOfWork = dynamic(() => import("@/components/ProofOfWork"), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#F5F3EE]" />,
});

const Contact = dynamic(() => import("@/components/Contact"), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-[#F5F3EE]" />,
});

export default function Home() {
  return (
    <>
      <Hero />
      <Projects />
      <About />
      <Skills />
      <ProofOfWork />
      <Contact />
    </>
  );
}
