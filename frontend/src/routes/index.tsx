import { createFileRoute } from "@tanstack/react-router";
import { MyNavbar } from "@/components/navbar";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div>
			<MyNavbar />
			Catalogus
		</div>
	);
}
