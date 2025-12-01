import { WatchlistItem } from "@/types/watchlistItem";
import { MediaGridCard } from "./mediaGridCard";
import { BlurFade } from "../ui/blur-fade";

interface WatchlistGridProps {
	items: WatchlistItem[];
}

export function WatchlistGrid({ items }: WatchlistGridProps) {
	return (
		<div className="grid grid-cols-5 gap-4">
			{items.map((item) => (
				<BlurFade
					key={item.wishlistId}
					delay={0.05 * items.indexOf(item) * 0.25}
					inView
				>
					<MediaGridCard key={item.wishlistId} item={item} />
				</BlurFade>
			))}
		</div>
	);
}
