"use client";

import { useState } from "react";
import { Mail, Lock, User, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

function InputWithIcon({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<"input"> & { icon: React.ElementType }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn("h-11 pl-9 text-sm", className)} {...props} />
    </div>
  );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  return (
    <>
      <div className="rounded-t-xl bg-gradient-to-br from-violet-600 to-purple-700 px-6 pb-8 pt-5">
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-semibold text-white">IntervueAI</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
        <p className="mt-1 text-sm text-white/70">Continue your interview journey</p>
      </div>

      <div className="px-6 pb-6 pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <InputWithIcon icon={Mail} type="email" placeholder="you@example.com" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Password</label>
            <InputWithIcon icon={Lock} type="password" placeholder="••••••••" />
          </div>

          <Button className="mt-1 h-11 w-full rounded-lg bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700">
            Sign In
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <button
              onClick={onSwitch}
              className="font-semibold text-violet-600 hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  return (
    <>
      <div className="rounded-t-xl bg-gradient-to-br from-violet-600 to-purple-700 px-6 pb-8 pt-5">
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-semibold text-white">IntervueAI</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Create your account</h2>
        <p className="mt-1 text-sm text-white/70">Start practicing in seconds</p>
      </div>

      <div className="px-6 pb-6 pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Name</label>
            <InputWithIcon icon={User} type="text" placeholder="Jane Doe" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <InputWithIcon icon={Mail} type="email" placeholder="you@example.com" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Password</label>
            <InputWithIcon icon={Lock} type="password" placeholder="••••••••" />
          </div>

          <Button className="mt-1 h-11 w-full rounded-lg bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700">
            Create Account
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Have an account?{" "}
            <button
              onClick={onSwitch}
              className="font-semibold text-violet-600 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export function AuthDialog({
  defaultMode = "login",
  trigger,
}: {
  defaultMode?: AuthMode;
  trigger: React.ReactNode;
}) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent
        className="overflow-hidden p-0 sm:max-w-sm"
        showCloseButton
      >
        {mode === "login" ? (
          <LoginForm onSwitch={() => setMode("signup")} />
        ) : (
          <SignupForm onSwitch={() => setMode("login")} />
        )}
      </DialogContent>
    </Dialog>
  );
}
