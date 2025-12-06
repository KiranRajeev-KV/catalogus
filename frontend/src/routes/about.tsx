import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Code2, Database, Github, Heart, Tv } from "lucide-react";
import { motion } from "motion/react";
import { MyNavbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
	component: AboutPage,
});

function AboutPage() {
	return (
		<div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">
			{/* Navbar */}
			<div className="fixed top-0 left-0 w-full z-50">
				<MyNavbar />
			</div>

			{/* Ambience Lightss */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full" />
				<div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full" />
			</div>

			<main className="relative z-10 container mx-auto px-4 py-32 max-w-4xl">
				{/* TITLE */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center space-y-6 mb-24"
				>
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
						<Code2 className="w-4 h-4" />
						<span>Hobby Project</span>
					</div>

					<h1 className="text-4xl md:text-6xl font-black tracking-tight">
						From a{" "}
						<span className="text-muted-foreground line-through decoration-primary/50 decoration-4">
							text file
						</span>{" "}
						<br />
						to a{" "}
						<span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">
							digital collection.
						</span>
					</h1>

					<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						Catalogus wasn't built to disrupt an industry. It was built because
						I was tired of managing my watchlist in Notepad.
					</p>
				</motion.div>

				{/* STORY OF ME */}
				<div className="grid md:grid-cols-2 gap-12 items-center mb-32">
					{/* The "Before" Card */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="relative group"
					>
						<div className="absolute inset-0 bg-red-500/10 blur-2xl rounded-full group-hover:bg-red-500/20 transition-colors" />
						<Card className="relative bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden transform group-hover:-rotate-2 transition-transform duration-300">
							<div className="bg-muted/50 p-3 border-b border-border/50 flex gap-2">
								<div className="w-3 h-3 rounded-full bg-red-500/50" />
								<div className="w-3 h-3 rounded-full bg-yellow-500/50" />
								<div className="w-3 h-3 rounded-full bg-green-500/50" />
								<span className="ml-auto text-xs text-muted-foreground font-mono">
									watchlist.txt
								</span>
							</div>
							<CardContent className="p-6 font-mono text-sm text-muted-foreground space-y-2">
								<p>1. Breaking Bad - Season 5 (???)</p>
								<p>2. One Piece - Ep 1070</p>
								<p>3. That movie with Ryan Gosling...</p>
								<p className="opacity-50">4. Interstellar (rewatch)</p>
								<div className="h-4 w-2 bg-primary/50 animate-pulse inline-block" />
							</CardContent>

							{/* "THE OLD WAY" Badge */}
							<div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full font-bold transform -rotate-12 shadow-xl border border-white/20">
									THE OLD WAY
								</span>
							</div>
						</Card>
					</motion.div>

					{/* STORY OF ME */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="space-y-6"
					>
						<h2 className="text-3xl font-bold">Chaos, Tamed.</h2>
						<p className="text-muted-foreground leading-relaxed">
							For years, I tracked everything I watched in a simple text file.
							It worked, until it didn't. I'd forget which episode I was on,
							lose track of release dates, and spent more time organizing the
							list than actually watching.
						</p>
						<p className="text-muted-foreground leading-relaxed">
							I decided to build a simple, clean, and fast solution. No ads, no
							bloat, just my list and the data I need.
						</p>
					</motion.div>
				</div>

				{/* POWERED BY */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-32"
				>
					<h2 className="text-3xl font-bold mb-12">Powered by Giants</h2>

					<div className="grid md:grid-cols-2 gap-6">
						{/* TMDB Card */}
						<Card className="bg-linear-to-br from-card to-background border-border/50 hover:border-[#01b4e4]/50 transition-colors group">
							<CardContent className="p-8 flex flex-col items-center gap-4">
								<div className="p-4 rounded-2xl bg-linear-to-br from-[#90cea1] to-[#01b4e4] group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#01b4e4]/20">
									<Database className="w-8 h-8 text-white" />
								</div>
								<h3 className="text-xl font-bold">The Movie Database</h3>
								<p className="text-muted-foreground text-sm">
									Catalogus connects directly to TMDB to fetch high-resolution
									posters, accurate release dates, and cast info for millions of
									Movies and TV Shows.
								</p>
							</CardContent>
						</Card>

						{/* AniList Card */}
						<Card className="bg-linear-to-br from-card to-background border-border/50 hover:border-[#02A9FF]/50 transition-colors group">
							<CardContent className="p-8 flex flex-col items-center gap-4">
								<div className="p-4 rounded-2xl bg-[#02A9FF] group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#02A9FF]/20">
									<Tv className="w-8 h-8 text-white" />
								</div>
								<h3 className="text-xl font-bold">AniList</h3>
								<p className="text-muted-foreground text-sm">
									For the otaku side of things, we use AniList's robust API to
									differentiate between Seasons, OVAs, and Movies, ensuring your
									anime progress is tracked correctly.
								</p>
							</CardContent>
						</Card>
					</div>
				</motion.div>

				{/* --- FOOTER CTA --- */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="relative rounded-3xl overflow-hidden border border-border/50 p-12 text-center"
				>
					<div className="absolute inset-0 bg-primary/5 backdrop-blur-sm -z-10" />
					<div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />

					<Heart className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />

					<h2 className="text-3xl font-bold mb-4">
						Ready to ditch the spreadsheet?
					</h2>
					<p className="text-muted-foreground mb-8 max-w-lg mx-auto">
						Join me in keeping our watchlists clean, beautiful, and up to date.
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Button
							asChild
							size="lg"
							className="rounded-full px-8 h-12 text-base font-semibold shadow-xl shadow-primary/20"
						>
							<Link to="/watchlist">
								Go to Watchlist <ArrowRight className="ml-2 w-5 h-5" />
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="rounded-full px-8 h-12 text-base"
						>
							<a
								href="https://github.com/kiranrajeev-kv/catalogus"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Github className="mr-2 w-5 h-5" /> View on GitHub
							</a>
						</Button>
					</div>
				</motion.div>
			</main>
		</div>
	);
}
