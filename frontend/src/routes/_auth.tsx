import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MyNavbar } from "@/components/navbar";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
});

function AuthLayout() {
	const navigate = useNavigate();
	const { data, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && !data?.session) {
			void navigate({ to: "/signin" });
		}
	}, [isPending, data?.session, navigate]);

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<p className="text-sm text-muted-foreground">Checking session...</p>
			</div>
		);
	}

	if (!data?.session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
			<MyNavbar />
			<Outlet />
		</div>
	);
}
