"use client";

import { BrainCog, LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthDialog } from "@/_shared/AuthDialog";
import { AuthModeEnum } from "@/_shared/types";
import { ApiClientService } from "@/app/_client-services/ApiService";
import { Button, buttonVariants } from "@/app/_shared-components/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_shared-components/Dialog";
import { Popover, PopoverItem } from "@/app/_shared-components/Popover";
import { useUser } from "@/app/contexts/UserContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "AI Interview", href: "/interview" },
];

export function Navbar() {
  const { user, setUser } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await ApiClientService.logout();
    setUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-white">
            <BrainCog size={16} />
          </span>
          <span className="text-sm font-bold tracking-tight">IntervueAI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        {user ? (
          <div className="hidden items-center gap-3 md:flex">
            <Popover
              trigger={
                <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 transition-colors hover:bg-muted">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
              }
            >
              <PopoverItem
                onClick={() => router.push("/profile")}
                className="flex items-center gap-2"
              >
                <User size={16} />
                <span>Profile</span>
              </PopoverItem>
              <PopoverItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </PopoverItem>
            </Popover>
          </div>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            <AuthDialog
              defaultMode={AuthModeEnum.LOGIN}
              trigger={
                <Button variant="outline" size="xs">
                  Log in
                </Button>
              }
            />
            <AuthDialog
              defaultMode={AuthModeEnum.SIGNUP}
              trigger={
                <Button variant="default" size="xs">
                  Sign up
                </Button>
              }
            />
          </div>
        )}

        {/* Mobile menu trigger */}
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "md:hidden"
            )}
          >
            <Menu size={18} />
            <span className="sr-only">Open menu</span>
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            className="left-0 top-0 h-full max-w-xs translate-x-0 translate-y-0 rounded-none data-open:slide-in-from-left data-closed:slide-out-to-left"
          >
            <DialogHeader className="flex-row items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-white">
                  <BrainCog size={16} />
                </span>
                IntervueAI
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </Button>
            </DialogHeader>

            <nav className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-2 pt-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/profile");
                    }}
                    className="flex items-center justify-center gap-2"
                  >
                    <User size={16} />
                    Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <AuthDialog
                    defaultMode={AuthModeEnum.LOGIN}
                    trigger={
                      <span className={cn(buttonVariants({ variant: "outline" }))}>
                        Log in
                      </span>
                    }
                  />
                  <AuthDialog
                    defaultMode={AuthModeEnum.SIGNUP}
                    trigger={
                      <span
                        className={cn(
                          buttonVariants(),
                          "bg-purple-600 text-white hover:bg-purple-700"
                        )}
                      >
                        Sign up
                      </span>
                    }
                  />
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
