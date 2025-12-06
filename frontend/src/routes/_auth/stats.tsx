// frontend/src/routes/_auth/stats.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Construction, ArrowLeft, Hammer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_auth/stats')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-2 p-4 text-center">
      
      {/* ANIMATED ICON */}
      <motion.div 
        className="relative mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Blob */}
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
        
        {/* Main Floating Icon */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative z-10 bg-card border shadow-xl p-6 rounded-2xl"
        >
          <Construction className="w-16 h-16 text-primary" />
          
          {/* Orbiting Hammer Icon */}
          <motion.div 
             className="absolute -right-4 -top-4 bg-secondary p-2 rounded-full shadow-sm"
             animate={{ rotate: [0, 360] }}
             transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
             <Hammer className="w-5 h-5 text-secondary-foreground" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* TEXT */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-3 max-w-md"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Stats Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          We are currently crunching the numbers and building the charts. Check back soon for insights into your watching habits!
        </p>
      </motion.div>

      {/* LOADING BAR */}
      <motion.div 
        className="w-64 h-2 bg-secondary rounded-full mt-6 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div 
          className="h-full bg-primary"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      </motion.div>

      {/* --- Go Back Action --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <Button asChild variant="outline" className="gap-2">
          <Link to="/watchlist">
            <ArrowLeft className="w-4 h-4" />
            Back to Watchlist
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}