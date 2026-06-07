"use client";

import { Lock, Mail, Sparkles, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthModeEnum } from "@/_shared/types";
import { ApiClientService } from "@/app/_client-services/ApiService";
import { Button } from "@/app/_shared-components/Button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/app/_shared-components/Dialog";
import { Input } from "@/app/_shared-components/Input";
import { useUser } from "@/app/contexts/UserContext";
import { cn } from "@/lib/utils";

function InputWithIcon({
  icon: Icon,
  className,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  icon: React.ElementType;
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={cn("h-11 pl-9 text-sm", className)}
      />
    </div>
  );
}

function LoginForm({
  onSwitch,
  onSuccess,
}: {
  onSwitch: () => void;
  onSuccess: () => void;
}) {
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: apiError } = await ApiClientService.login({
        email:email.trim(),
        password:password.trim(),
      });

      if (apiError || !data) {
        setError(apiError || "Login failed");
        return;
      }

      onSuccess();
      setUser(data);
    } catch (_err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-t-xl bg-linear-to-br from-violet-600 to-purple-700 px-6 pb-8 pt-5">
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-semibold text-white">IntervueAI</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
        <p className="mt-1 text-sm text-white/70">
          Continue your interview journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 pb-6 pt-6">
        <div className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Email
            </label>
            <InputWithIcon
              icon={User}
              type="text"
              placeholder="your_username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <InputWithIcon
              icon={Lock}
              type="password"
              placeholder="••••••••"
              // minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-1 h-11 w-full rounded-lg bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Button
              variant="link"
              size="sm"
              onClick={onSwitch}
            >
              Create an account
            </Button>
          </p>
        </div>
      </form>
    </>
  );
}

function SignupForm({
  onSwitch,
  onSuccess,
}: {
  onSwitch: () => void;
  onSuccess: () => void;
}) {
  const { setUser } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: apiError } = await ApiClientService.signup({
        username:username.trim(),
        password:password.trim(),
        email:email.trim(),
      });

      if (apiError || !data) {
        setError(apiError || "Signup failed");
        return;
      }
      setUser(data);
      onSuccess();
    } catch (_err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-t-xl bg-linear-to-br from-violet-600 to-purple-700 px-6 pb-8 pt-5">
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-semibold text-white">IntervueAI</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Create your account</h2>
        <p className="mt-1 text-sm text-white/70">
          Start practicing in seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 pb-6 pt-6">
        <div className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Username
            </label>
            <InputWithIcon
              icon={User}
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Email
            </label>
            <InputWithIcon
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <InputWithIcon
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-1 h-11 w-full rounded-lg bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Have an account?{" "}
            <Button
              variant="link"
              size="sm"
              onClick={onSwitch}
            >
              Sign in
            </Button>
          </p>
        </div>
      </form>
    </>
  );
}

export function AuthDialog({
  defaultMode = AuthModeEnum.LOGIN,
  trigger,
}: {
  defaultMode?: AuthModeEnum;
  trigger: React.ReactNode;
}) {
  const {user} = useUser();
  const router = useRouter(); 
  const [mode, setMode] = useState<AuthModeEnum>(defaultMode);
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleOpen=(open: boolean)=>{
    if(user){
      router.push("/interview");
      return;
    }
    setOpen(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent
        className="overflow-hidden p-0 sm:max-w-sm"
        showCloseButton
      >
        {mode === AuthModeEnum.LOGIN ? (
          <LoginForm
            onSwitch={() => setMode(AuthModeEnum.SIGNUP)}
            onSuccess={handleSuccess}
          />
        ) : (
          <SignupForm
            onSwitch={() => setMode(AuthModeEnum.LOGIN)}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
