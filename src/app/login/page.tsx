import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/auth/login-button";
import { Zap } from "lucide-react";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold">AdFi</h1>
          <p className="mt-2 text-muted-foreground">
            Affiliate marketing made simple.<br />
            Sign in to access your dashboard.
          </p>
        </div>

        <LoginButton />

        <p className="text-center text-xs text-muted-foreground">
          By signing in you agree to our terms of service. We request Google Ads
          access so you can manage your campaigns directly.
        </p>
      </div>
    </div>
  );
}
