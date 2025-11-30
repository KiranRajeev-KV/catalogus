import { MyNavbar } from "@/components/navbar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div>
			<MyNavbar />
			Catalogus
		</div>
	);
}
