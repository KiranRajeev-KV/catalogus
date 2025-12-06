import { useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Loader2, GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { authClient } from "../lib/auth-client";
import { Link } from "@tanstack/react-router";

export function SignupForm({
  className,
}: {
  className?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    await authClient.signUp.email(
      { email, password, name, callbackURL: "/watchlist" },
      {
        onError: (ctx) => {
          toast.error(`Error: ${ctx.error.message}`);
          setIsLoading(false);
        },
        onSuccess: () => {
             // Redirect handled by callbackURL, but good to have a state reset or toast
             toast.success("Account created successfully!");
        }
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
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to start tracking your shows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50"
              />
            </div>

            {/* Email */}
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

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
                Must be at least 8 characters long.
            </p>

            <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" disabled={isLoading}>
              {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground pt-2">
                Already have an account?{" "}
                <Link to="/signin" className="underline underline-offset-4 hover:text-primary transition-colors">
                    Sign in
                </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}