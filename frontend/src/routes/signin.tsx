import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/login-form";

export const Route = createFileRoute("/signin")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-linear-to-b from-background via-background to-muted/25 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<LoginForm />
			</div>
		</div>
	);
}
