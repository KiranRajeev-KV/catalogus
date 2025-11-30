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
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { authClient } from "../lib/auth-client";

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			alert("Passwords do not match");
			return;
		}

		setIsLoading(true);
		// biome-ignore lint/correctness/noUnusedVariables: just not used
		const { data, error } = await authClient.signUp.email(
			{ email, password, name, callbackURL: "/dashboard" },
			{
				onError: (ctx) => {
					toast.error(`Error: ${ctx.error.message}`);
				},
			},
		);

		setIsLoading(false);
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Create your account</CardTitle>
					<CardDescription>
						Enter your email below to create your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="name">Username</FieldLabel>
								<Input
									id="name"
									type="text"
									placeholder="John Doe"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</Field>
							<Field>
								<Field className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="password">Password</FieldLabel>
										<Input
											id="password"
											type="password"
											required
											minLength={8}
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor="confirm-password">
											Confirm Password
										</FieldLabel>
										<Input
											id="confirm-password"
											type="password"
											required
											minLength={8}
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
										/>
									</Field>
								</Field>
								<FieldDescription>
									Must be at least 8 characters long.
								</FieldDescription>
							</Field>
							<Field>
								<Button type="submit" disabled={isLoading}>
									{isLoading ? "Creating..." : "Create Account"}
								</Button>
								<FieldDescription className="text-center">
									Already have an account? <a href="/signin">Sign in</a>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
