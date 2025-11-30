import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { MyNavbar } from "@/components/navbar";
import { WatchlistTable } from "@/components/watchlist-components/table";

export const Route = createFileRoute("/watchlist")({
	component: RouteComponent,
	// beforeLoad: async (context) => {
	// 	console.log("Watchlist beforeLoad");
	// 	const session = await authClient.getSession();
	// 	console.log("Watchlist session:", session);
	// 	if (!session?.data?.user) {
	// 		throw redirect({to: "/signin" });
	// 	}
	// }
});

function RouteComponent() {
	return (
		<div>
			<MyNavbar />
			<div className="container mx-auto my-8 max-w-[75%]">
				<h1 className="text-5xl font-bold mb-4">My Watchlist</h1>
				<WatchlistTable />
			</div>
		</div>
	);
}
