"use client";

import { ArrowRight, Briefcase, Code, Plus, Sparkles, X } from "lucide-react";
import React, { useState, type KeyboardEvent } from "react";

import { Button } from "@/app/_shared-components/Button";
import { Input } from "@/app/_shared-components/Input";
import { cn } from "@/lib/utils";

type InterviewMode = "skill" | "job";

const SUGGESTED_SKILLS = [
  "React",
  "Python",
  "SQL",
  "Node.js",
  "Machine Learning",
  "Data Structures",
];

export default function InterviewPage() {
  const [mode, setMode] = useState<InterviewMode>("skill");
  const [skills, setSkills] = useState<string[]>(["System Design", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const _data = {
      mode: formData.get("mode"),
      skills: mode === "skill" ? skills : undefined,
      jobTitle: mode === "job" ? formData.get("jobTitle") : undefined,
      company: mode === "job" ? formData.get("company") : undefined,
      experienceLevel: formData.get("experienceLevel"),
      experienceText: formData.get("experienceText"),
    };
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const addSuggestedSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
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
        <form
          onSubmit={(e)=> handleSubmit(e)}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5"
        >
          <input type="hidden" name="mode" value={mode} />
          {skills.map((skill, index) => (
            <input key={skill} type="hidden" name={`skills[${index}]`} value={skill} />
          ))}

          {/* Mode selection */}
          <div className="mb-8 grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("skill")}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                mode === "skill"
                  ? "border-violet-500 bg-violet-50/50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  mode === "skill" ? "bg-violet-500" : "bg-slate-100"
                )}
              >
                <Code
                  className={cn(
                    "h-5 w-5",
                    mode === "skill" ? "text-white" : "text-slate-600"
                  )}
                />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-slate-900">Skill-based</h3>
                <p className="text-sm text-slate-600">
                  Drill specific skills like React, SQL, or System Design.
                </p>
              </div>
            </button>

            <button
              onClick={() => setMode("job")}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                mode === "job"
                  ? "border-violet-500 bg-violet-50/50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  mode === "job" ? "bg-violet-500" : "bg-slate-100"
                )}
              >
                <Briefcase
                  className={cn(
                    "h-5 w-5",
                    mode === "job" ? "text-white" : "text-slate-600"
                  )}
                />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-slate-900">Job-based</h3>
                <p className="text-sm text-slate-600">
                  Simulate a real interview for a specific role and company.
                </p>
              </div>
            </button>
          </div>

          {/* Conditional content based on mode */}
          {mode === "skill" ? (
            /* Skills section */
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-slate-900">
                Skills to practice
              </label>

              {/* Input with Add button */}
              <div className="mb-3 flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter"
                  className="h-10"
                />
                <Button
                  onClick={handleAddSkill}
                  variant="outline"
                  className="h-10 gap-2 border-violet-200 text-violet-600 hover:bg-violet-50"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {/* Selected skills */}
              {skills.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-700"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="rounded hover:bg-violet-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested skills */}
              <div>
                <p className="mb-2 text-xs text-slate-500">Suggested:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSuggestedSkill(skill)}
                      disabled={skills.includes(skill)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm transition-all",
                        skills.includes(skill)
                          ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                          : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                      )}
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Job-based section */
            <>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Job title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="jobTitle"
                  placeholder="e.g. Senior Frontend Engineer"
                  className="h-10"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Company{" "}
                  <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <Input
                  name="company"
                  placeholder="e.g. Stripe"
                  className="h-10"
                />
              </div>
            </>
          )}

          {/* Experience level */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-slate-900">
              Experience level
            </label>
            <div className="flex flex-wrap gap-2">
              {(["junior", "mid", "senior", "staff"] as const).map((level) => {
                let label = level.charAt(0).toUpperCase() + level.slice(1);
                if (level === "mid") {
                  label = "Mid-level";
                } else if (level === "staff") {
                  label = "Staff+";
                }

                return (
                  <label key={level}>
                    <input
                      type="radio"
                      name="experienceLevel"
                      value={level}
                      defaultChecked={level === "mid"}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "block cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all",
                        "bg-slate-100 text-slate-700 hover:bg-slate-200",
                        "peer-checked:bg-violet-600 peer-checked:text-white peer-checked:shadow-md"
                      )}
                    >
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Experience description */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-slate-900">
              Tell us about your experience{" "}
              <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              name="experienceText"
              placeholder="Briefly describe your background, projects, or what you'd like to focus on..."
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors outline-none placeholder:text-slate-400 focus-visible:border-violet-500 focus-visible:ring-3 focus-visible:ring-violet-500/20"
            />
          </div>

          {/* Continue button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-11 gap-2 rounded-lg bg-violet-600 px-6 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
