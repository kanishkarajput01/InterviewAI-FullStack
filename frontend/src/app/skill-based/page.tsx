"use client";

import { ArrowRight, Plus, Sparkles, X } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/app/_shared-components/Button";
import { Input } from "@/app/_shared-components/Input";
import { cn } from "@/lib/utils";

const SUGGESTED_SKILLS = [
  "React",
  "Python",
  "SQL",
  "Node.js",
  "Machine Learning",
  "Data Structures",
];

export default function SkillBasedPage() {
  const [skills, setSkills] = useState<string[]>(["System Design", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
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

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const _data = {
      mode: "skill",
      skills,
      experienceLevel: formData.get("experienceLevel"),
    };
  };

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
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
            {skills.map((skill, index) => (
              <input key={skill} type="hidden" name={`skills[${index}]`} value={skill} />
            ))}

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
                      <Button
                        variant="ghost"
                        onClick={() => removeSkill(skill)}
                        className="rounded hover:bg-violet-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested skills */}
              <div>
                <p className="mb-2 text-xs text-slate-500">Suggested:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.map((skill) => (
                    <Button
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
                    </Button>
                  ))}
                </div>
              </div>
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
    </div>
  );
}
