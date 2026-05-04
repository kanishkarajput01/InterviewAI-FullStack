"use client";

import Link from "next/link";
import { BrainCircuit, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "AI Interview", href: "/interview" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-white">
            <BrainCircuit size={16} />
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
        <div className="hidden items-center gap-2 md:flex">
          <AuthDialog
            defaultMode="login"
            trigger={
              <span className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Log in
              </span>
            }
          />
          <AuthDialog
            defaultMode="signup"
            trigger={
              <span
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-purple-700 text-background hover:bg-purple-700"
                )}
              >
                Sign up
              </span>
            }
          />
        </div>

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
                  <BrainCircuit size={16} />
                </span>
                IntervueAI
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon-sm"
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
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants(),
                  "bg-purple-700 text-background hover:bg-purple-700"
                )}
              >
                Sign up
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
