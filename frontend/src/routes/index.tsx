import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { ArrowRight, Sparkles, Database, Tv } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { MyNavbar } from "@/components/navbar"

export const Route = createFileRoute("/")({ component: App })

const POSTERS = [
  "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
  "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
  "https://image.tmdb.org/t/p/w500/uJYYizSuA9Y3DCs0qS4qWvHfZg4.jpg",
  "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
  "https://image.tmdb.org/t/p/w500/pFlaoHTZeyNkG83vxsAJiGzfSsa.jpg",
]

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="relative min-h-screen w-full bg-linear-to-b from-background via-background to-background/95 text-foreground overflow-hidden">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <MyNavbar />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: "spring", damping: 30, mass: 0.2 }}
        />
        <motion.div
          className="absolute top-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 0.5,
            y: mousePosition.y * 0.3,
          }}
          transition={{ type: "spring", damping: 40, mass: 0.3 }}
        />

        {/* Tilted marquee background */}
        <div className="absolute inset-0 opacity-30 select-none flex flex-col justify-center rotate-[-5deg] scale-110">
          <MarqueeRow direction="left" speed={50} />
          <MarqueeRow direction="right" speed={40} className="mt-8" />
          <MarqueeRow direction="left" speed={45} className="mt-8" />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-background" />
      </div>

      {/* HERO SECTION */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 text-center pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-8 max-w-5xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium border border-primary/20 backdrop-blur-md hover:bg-primary/10 transition-colors duration-300">
              <Sparkles className="w-4 h-4" />
              <span>Your Entertainment Hub Awaits</span>
            </div>
          </motion.div>

          {/* TITLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight">
              <span className="inline-block bg-clip-text text-transparent bg-linear-to-r from-foreground via-foreground to-foreground/60">
                Catalogus
              </span>
              <span className="text-primary">.</span>
            </h1>
          </motion.div>

          {/* DESC */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl leading-relaxed font-light"
          >
            Track every <span className="text-foreground font-semibold">movie</span>,{" "}
            <span className="text-foreground font-semibold">show</span>, and{" "}
            <span className="text-foreground font-semibold">anime</span> in one beautiful place. Never forget what you
            wanted to watch.
          </motion.p>

          {/* ACTIONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mt-6"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                className="h-14 px-10 text-base md:text-lg rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 font-semibold"
              >
                <Link to="/watchlist" className="flex items-center gap-2">
                  Start Tracking
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-14 px-10 text-base md:text-lg rounded-full backdrop-blur-md hover:bg-secondary/80 transition-all duration-300 font-semibold"
              >
                <Link to="/stats">View Stats</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* POWERED BY */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col items-center gap-6 mt-16 pt-10 border-t border-border/40 w-full max-w-2xl"
          >
            <p className="text-sm font-medium text-muted-foreground/60 tracking-widest uppercase">
              Powered by world-class data
            </p>

            <div className="flex flex-wrap justify-center gap-6 md:gap-12 items-center">
              {/* TMDB Badge */}
              <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/30 border border-border/50 hover:border-[#01b4e4]/50 hover:bg-[#01b4e4]/5 transition-all duration-300 cursor-default backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-linear-to-br from-[#90cea1] to-[#01b4e4] group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg leading-none bg-clip-text text-transparent bg-linear-to-r from-[#90cea1] to-[#01b4e4]">
                    TMDB
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">Movies & TV</p>
                </div>
              </div>

              {/* Anilist Badge */}
              <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/30 border border-border/50 hover:border-[#02A9FF]/50 hover:bg-[#02A9FF]/5 transition-all duration-300 cursor-default backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-[#02A9FF] group-hover:scale-110 transition-transform duration-300">
                  <Tv className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg leading-none text-[#02A9FF]">AniList</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Anime</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-8 text-center text-muted-foreground/50 text-sm border-t border-border/40">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}>
          © {new Date().getFullYear()} Catalogus. Built with care for entertainment lovers by{" "}
          <a
            href="https://github.com/kiranrajeev-kv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors font-medium underline decoration-dotted underline-offset-4"
          >
            kiranrajeev-kv
          </a>
          .
        </motion.p>
      </footer>
    </div>
  )
}

function MarqueeRow({
  direction = "left",
  speed = 20,
  className = "",
}: {
  direction?: "left" | "right"
  speed?: number
  className?: string
}) {
  return (
    <div className={`flex overflow-hidden gap-6 ${className}`}>
      <motion.div
        className="flex gap-6 min-w-max"
        initial={{ x: direction === "left" ? 0 : "-50%" }}
        animate={{ x: direction === "left" ? "-50%" : 0 }}
        transition={{
          duration: speed,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatType: "loop",
        }}
      >
        {[...POSTERS, ...POSTERS, ...POSTERS].map((src, i) => (
          <div
            key={i}
            className="w-40 h-60 md:w-56 md:h-80 rounded-2xl overflow-hidden shadow-xl opacity-30 grayscale hover:grayscale-0 hover:opacity-60 hover:scale-105 transition-all duration-500 ease-out cursor-default shrink-0"
          >
            <img src={src || "/placeholder.svg"} alt="Poster" className="w-full h-full object-cover" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default App