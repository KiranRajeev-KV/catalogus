import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { MyNavbar } from "@/components/navbar";
import { getAuthSession } from "@/lib/auth-server";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ location }) => {
		const authData = await getAuthSession();

		if (!authData?.session) {
			throw redirect({
				to: "/signin",
				search: {
					redirect: location.href,
				},
			});
		}

		// 3. Return the full data so children can access 'user' info
		return {
			session: authData.session,
			user: authData.user,
		};
	},
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<div>
			<MyNavbar />
			<Outlet />
		</div>
	);
}
