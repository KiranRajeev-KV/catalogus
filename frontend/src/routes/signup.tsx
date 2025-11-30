import { createFileRoute } from "@tanstack/react-router";
import { SignupForm } from "@/components/signup-form";
import { GalleryVerticalEnd } from "lucide-react";

export const Route = createFileRoute("/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<a
					href="/"
					className="flex flex-col items-center gap-2 self-center font-medium text-4xl text-primary-foreground"
				>
					<div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-md">
						<GalleryVerticalEnd className="size-8" />
						{/* <img width="40" height="40" src="https://img.icons8.com/liquid-glass/48/movie-projector.png" alt="movie-projector"/> */}
					</div>
					Welcome to Catalogus
				</a>
				<SignupForm />
			</div>
		</div>
	);
}
