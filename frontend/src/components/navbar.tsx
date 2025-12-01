import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuIndicator,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { authClient } from "@/lib/auth-client";
import { Link, useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

export function MyNavbar() {
	const navigate = useNavigate();
	const session = authClient.useSession();
	console.log("Navbar session:", session);

	return (
		<nav className="w-full sticky top-0 z-50 border-b-1 border-primary py-6 backdrop-blur-md bg-secondary">
			{/* Navbar */}
			<NavigationMenu className="max-w-[75%] mx-auto flex flex-row items-center">
				{/* Logo & Name */}
				<div className="flex flex-row items-center flex-1">
					<div className="bg-primary text-primary-foreground flex p-1 items-center justify-center rounded-md">
						<GalleryVerticalEnd />
					</div>
					<span className="ml-2 font-semibold text-3xl text-primary">
						Catalogus
					</span>
				</div>

				{/* Center Navigation Links */}
				<NavigationMenuList className="flex flex-row justify-center gap-8 items-center text-lg font-medium">
					<NavigationMenuItem className="hover:underline underline-offset-4 decoration-2 decoration-primary transition-all ease-in-out hover:scale-105 hover:duration-300">
						<Link to="/watchlist">Watchlist</Link>
					</NavigationMenuItem>
					<NavigationMenuItem className="hover:underline underline-offset-4 decoration-2 decoration-primary transition-all ease-in-out hover:scale-105 hover:duration-300">
						<Link to="/movies">Movies</Link>
					</NavigationMenuItem>
					<NavigationMenuItem className="hover:underline underline-offset-4 decoration-2 decoration-primary transition-all ease-in-out hover:scale-105 hover:duration-300">
						<Link to="/tv-shows">TV Shows</Link>
					</NavigationMenuItem>
					<NavigationMenuItem className="hover:underline underline-offset-4 decoration-2 decoration-primary transition-all ease-in-out hover:scale-105 hover:duration-300">
						<Link to="/anime">Anime</Link>
					</NavigationMenuItem>
					<NavigationMenuItem className="hover:underline underline-offset-4 decoration-2 decoration-primary transition-all ease-in-out hover:scale-105 hover:duration-300">
						<Link to="/drama">Dramas</Link>
					</NavigationMenuItem>
				</NavigationMenuList>

				{/* Login/Logout */}
				<div className="flex justify-end flex-1 gap-2">
					<AnimatedThemeToggler />
					{!session.data ? (
						<div className="flex gap-2">
							<Button
								variant="secondary"
								className="text-lg cursor-pointer hover:scale-105 hover:duration-300 hover:bg-accent hover:text-accent-foreground"
								onClick={() => navigate({ to: "/signin" })}
							>
								Login
							</Button>
							<Button
								variant="default"
								className="text-lg cursor-pointer"
								onClick={() => navigate({ to: "/signup" })}
							>
								Sign Up
							</Button>
						</div>
					) : (
						<Button
							variant="destructive"
							className="text-lg cursor-pointer"
							onClick={() => {
								authClient.signOut({
									fetchOptions: {
										onSuccess: () => navigate({ to: "/signin" }),
									},
								});
							}}
						>
							Logout
						</Button>
					)}
				</div>
				<NavigationMenuViewport />
			</NavigationMenu>
		</nav>
	);
}
