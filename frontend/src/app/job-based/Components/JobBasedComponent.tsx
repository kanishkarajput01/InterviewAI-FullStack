"use client";

import { ArrowRight, Globe, Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { AuthModeEnum } from "@/_shared/types";
import ApiClientService from "@/app/_client-services/ApiService";
import { AuthDialog } from "@/app/_shared-components/AuthDialog";
import { Button } from "@/app/_shared-components/Button";
import { Input } from "@/app/_shared-components/Input";
import { useUser } from "@/app/contexts/UserContext";
import { cn } from "@/lib/utils";

const EXPERIENCE_LEVELS = [
  { label: "0-1 years", value: 1, bgColor: "bg-emerald-100", borderColor: "peer-checked:border-emerald-500", dotColor: "bg-emerald-500" },
  { label: "1-2 years", value: 2, bgColor: "bg-indigo-50", borderColor: "peer-checked:border-indigo-500", dotColor: "bg-indigo-500" },
  { label: "2-3 years", value: 3, bgColor: "bg-violet-50", borderColor: "peer-checked:border-violet-500", dotColor: "bg-violet-500" },
  { label: "3-5 years", value: 5, bgColor: "bg-pink-50", borderColor: "peer-checked:border-pink-500", dotColor: "bg-pink-500" },
  { label: "5-7 years", value: 7, bgColor: "bg-orange-50", borderColor: "peer-checked:border-orange-500", dotColor: "bg-orange-500" },
  { label: "7-10 years", value: 10, bgColor: "bg-red-50", borderColor: "peer-checked:border-red-500", dotColor: "bg-red-500" },
] as const;

export default function JobBasedComponent() {
  const { user } = useUser();
  const [form, setForm] = useState({
    jobTitle: "",
    experienceLevel: 1,
    isPublic: false,
  });
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setShowAuth(true);
      return;
    }
    const formData = new FormData(e.currentTarget);
    const jobRole = formData.get("jobTitle") as string || '';
    const experience = Number(formData.get("experienceLevel"));
  
    if(!jobRole || !experience) {
      return;
    }
    setIsSubmitting(true);
    const { data, error: apiError } = await ApiClientService.createSession({
      jobRole,
      experience,
      isPublic: form.isPublic,
    });
    if(apiError || !data) {
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    router.push(`/session/${data.id}`);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm text-violet-600">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">Step 1 of 2</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900">
            Design your <span className="text-violet-600">interview</span>
          </h1>
          <p className="text-base text-slate-600">
            Pick what you want to practice. We&apos;ll build a tailored session.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Job title <span className="text-red-500">*</span>
              </label>
              <Input
                name="jobTitle"
                placeholder="e.g. Senior Frontend Engineer"
                className="h-10"
                required
                onChange={handleChange}
                value={form.jobTitle}
              />
            </div>

            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-slate-900">
                Experience level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {EXPERIENCE_LEVELS.map(({ value, label, bgColor, borderColor, dotColor }) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      value={value}
                      defaultChecked={value === 1}
                      className="peer sr-only"
                      onChange={handleChange}
                    />
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center rounded-2xl border-2 px-4 py-6 transition-all",
                        bgColor,
                        "border-transparent",
                        borderColor
                      )}
                    >
                      <div className={cn("mb-3 h-3 w-3 rounded-full", dotColor)} />
                      <span className="text-sm font-semibold text-slate-900">
                        {label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-slate-900">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    isPublicValue: false,
                    label: "Private",
                    description: "Only visible to you",
                    Icon: Lock,
                    bgColor: "bg-slate-50",
                    borderColor: "peer-checked:border-slate-500",
                    iconColor: "peer-checked:[&_svg]:text-slate-500",
                    ringColor: "peer-checked:[&_[data-radio-ring]]:border-slate-500",
                    dotColor: "peer-checked:[&_[data-radio-dot]]:bg-slate-500 peer-checked:[&_[data-radio-dot]]:scale-100",
                  },
                  {
                    isPublicValue: true,
                    label: "Public",
                    description: "Anyone can view this interview",
                    Icon: Globe,
                    bgColor: "bg-violet-50",
                    borderColor: "peer-checked:border-violet-500",
                    iconColor: "peer-checked:[&_svg]:text-violet-500",
                    ringColor: "peer-checked:[&_[data-radio-ring]]:border-violet-500",
                    dotColor: "peer-checked:[&_[data-radio-dot]]:bg-violet-500 peer-checked:[&_[data-radio-dot]]:scale-100",
                  },
                ].map(({ isPublicValue, label, description, Icon, bgColor, borderColor, iconColor, ringColor, dotColor }) => (
                  <label key={label} className="cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={form.isPublic === isPublicValue}
                      className="peer sr-only"
                      onChange={() => setForm((f) => ({ ...f, isPublic: isPublicValue }))}
                    />
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border-2 px-4 py-4 transition-all",
                        bgColor,
                        "border-transparent",
                        borderColor,
                        iconColor,
                        ringColor,
                        dotColor
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0 text-slate-300" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-500">{description}</p>
                      </div>
                      <div
                        data-radio-ring=""
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 transition-colors"
                      >
                        <div
                          data-radio-dot=""
                          className="h-2 w-2 scale-0 rounded-full transition-transform"
                        />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Continue button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!form.jobTitle || !form.experienceLevel }
                size="sm"
                className="ap-2 rounded-lg bg-violet-600 px-6 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <AuthDialog
            defaultMode={AuthModeEnum.LOGIN}
            open={showAuth}
            onOpenChange={setShowAuth}
          />
        </div>
      </div>
    </div>
  );
}
