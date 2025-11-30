import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const session = authClient.useSession();

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome, {session?.data?.user?.name || "User"}!</p>
			<button
				type="button"
				onClick={() =>
					authClient.signOut({
						fetchOptions: {
							onSuccess: () => {
								window.location.href = "/signup";
							},
						},
					})
				}
			>
				Sign Out
			</button>
		</div>
	);
}
