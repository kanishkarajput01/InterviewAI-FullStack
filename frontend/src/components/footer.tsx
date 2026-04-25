import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          © {new Date().getFullYear()} IntervueAI. Crafted for confident interviews.
        </div>

        <nav className="flex items-center gap-5">
          {footerLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
