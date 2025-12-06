"use client";

import { Link } from "@tanstack/react-router";
import { GalleryVerticalEnd, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authClient } from "../lib/auth-client";

export function LoginForm({ className }: React.ComponentProps<"div">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		await authClient.signIn.email(
			{
				email,
				password,
				rememberMe: true,
				callbackURL: "/watchlist",
			},
			{
				onError: (ctx) => {
					toast.error(`Error: ${ctx.error.message}`);
					setIsLoading(false);
				},
				onSuccess: () => {
					setIsLoading(false);
					toast.success("Welcome back!");
				},
			},
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={cn("flex flex-col gap-6 w-full max-w-md", className)}
		>
			<Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
				<CardHeader className="text-center space-y-2">
					<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-2">
						<GalleryVerticalEnd className="h-6 w-6" />
					</div>
					<CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
					<CardDescription>
						Login to access your personalized catalog
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="bg-background/50"
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
								<a
									href="/forgot-password"
									className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-primary transition-colors"
								>
									Forgot your password?
								</a>
							</div>
							<Input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-background/50"
							/>
						</div>

						<Button
							type="submit"
							className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging
									in...
								</>
							) : (
								"Login"
							)}
						</Button>

						<div className="text-center text-sm text-muted-foreground pt-2">
							Don&apos;t have an account?{" "}
							<Link
								to="/signup"
								className="underline underline-offset-4 hover:text-primary transition-colors"
							>
								Sign up
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</motion.div>
	);
}
