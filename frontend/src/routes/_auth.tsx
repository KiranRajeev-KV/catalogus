// routes/_auth.tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ location }) => {
		const session = await authClient.getSession();

		// We pass the current location to redirect back after login
		if (!session?.data) {
			throw redirect({
				to: "/signin",
				search: {
					redirect: location.href,
				},
			});
		}

		return { session: session.data };
	},
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<div>
			<Outlet />
		</div>
	);
}
