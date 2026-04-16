import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { GalleryVerticalEnd, Loader2, LogOut, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function MyNavbar() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const navigate = useNavigate();
	const router = useRouterState();
	const session = authClient.useSession();
	const currentPath = router.location.pathname;

	const navLinks = [
		{ name: "Watchlist", path: "/watchlist" },
		{ name: "Statistics", path: "/stats" },
		{ name: "About", path: "/about" },
	];

	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			className="sticky top-0 z-50 mx-auto w-[80%] border-b border-border/40 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60"
		>
			<div className="relative container mx-auto flex h-16 max-w-7xl items-center px-4">
				{/* TITLE */}
				<div className="flex items-center gap-2 mr-auto">
					<Link
						to="/"
						className="flex items-center gap-2 group"
						onClick={() => setIsMobileMenuOpen(false)}
					>
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
							<GalleryVerticalEnd className="h-5 w-5" />
						</div>
						<span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
							Catalogus.
						</span>
					</Link>
				</div>

				{/* LINKS */}
				<div className="hidden md:grid grid-cols-3 gap-1 bg-secondary/50 p-1 rounded-full border border-border/50">
					{navLinks.map((link) => {
						const isActive = currentPath === link.path;
						return (
							<Link
								key={link.path}
								to={link.path}
								className={cn(
									"relative py-1.5 text-sm font-medium transition-colors duration-200 rounded-full w-24 text-center",
									isActive
										? "text-primary-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{isActive && (
									<motion.div
										layoutId="navbar-pill"
										className="absolute inset-0 bg-primary rounded-full shadow-sm"
										transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
									/>
								)}
								<span className="relative z-10">{link.name}</span>
							</Link>
						);
					})}
				</div>

				{/* ACTIONS */}
				<div className="flex items-center gap-4 ml-auto">
					<div className="min-w-[140px] hidden md:flex justify-end">
						{session.isPending ? (
							<div className="flex items-center gap-2 text-muted-foreground animate-pulse">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span className="text-xs">Loading...</span>
							</div>
						) : !session.data ? (
							// LOGGED OUT STATE
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate({ to: "/signin" })}
									className="text-muted-foreground hover:text-foreground"
								>
									Log in
								</Button>
								<Button
									size="sm"
									onClick={() => navigate({ to: "/signup" })}
									className="rounded-full px-4 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105"
								>
									Sign Up
								</Button>
							</div>
						) : (
							// LOGGED IN STATE
							<div className="flex items-center gap-3">
								<div className="hidden md:flex flex-col items-end mr-2">
									<span className="font-medium leading-none">
										{session.data.user.name || "User"}
									</span>
								</div>

								<Button
									variant="secondary"
									size="icon"
									className="h-9 w-9 rounded-full border border-border/50"
									onClick={async () => {
										await authClient.signOut({
											fetchOptions: {
												onSuccess: async () => {
													navigate({ to: "/signin" });
												},
											},
										});
									}}
									title="Sign Out"
								>
									<LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
								</Button>
							</div>
						)}
					</div>
					<Button
						type="button"
						size="icon"
						variant="outline"
						className="md:hidden h-9 w-9 rounded-full"
						onClick={() => setIsMobileMenuOpen((prev) => !prev)}
						aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
						aria-expanded={isMobileMenuOpen}
					>
						{isMobileMenuOpen ? (
							<X className="h-4 w-4" />
						) : (
							<Menu className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, y: -12 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className="md:hidden border-t border-border/40 bg-card/96 p-4"
					>
						<div className="flex flex-col gap-2">
							{navLinks.map((link) => {
								const isActive = currentPath === link.path;
								return (
									<Link
										key={link.path}
										to={link.path}
										onClick={() => setIsMobileMenuOpen(false)}
										className={cn(
											"rounded-md px-3 py-2 text-sm font-medium transition-colors",
											isActive
												? "bg-primary text-primary-foreground"
												: "bg-secondary/40 text-foreground hover:bg-secondary",
										)}
									>
										{link.name}
									</Link>
								);
							})}
						</div>
						<div className="mt-4 border-t border-border/40 pt-4">
							{session.isPending ? (
								<div className="flex items-center gap-2 text-muted-foreground animate-pulse">
									<Loader2 className="h-4 w-4 animate-spin" />
									<span className="text-xs">Loading...</span>
								</div>
							) : !session.data ? (
								<div className="flex gap-2">
									<Button
										variant="ghost"
										size="sm"
										className="flex-1"
										onClick={() => {
											navigate({ to: "/signin" });
											setIsMobileMenuOpen(false);
										}}
									>
										Log in
									</Button>
									<Button
										size="sm"
										className="flex-1"
										onClick={() => {
											navigate({ to: "/signup" });
											setIsMobileMenuOpen(false);
										}}
									>
										Sign Up
									</Button>
								</div>
							) : (
								<div className="flex items-center justify-between gap-3">
									<span className="text-sm font-medium">
										{session.data.user.name || "User"}
									</span>
									<Button
										variant="secondary"
										size="sm"
										onClick={async () => {
											await authClient.signOut({
												fetchOptions: {
													onSuccess: async () => {
														navigate({ to: "/signin" });
													},
												},
											});
											setIsMobileMenuOpen(false);
										}}
									>
										<LogOut className="mr-2 h-4 w-4" />
										Sign Out
									</Button>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.nav>
	);
}
