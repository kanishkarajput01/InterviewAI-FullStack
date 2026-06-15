"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { type IInterview, InterviewPhaseEnum } from "@/_shared/types";
import ApiClientService from "@/app/_client-services/ApiService";
import { ErrorState } from "@/app/_shared-components/ErrorState";

import { AnswerInput } from "./AnswerInput";
import { FeedbackView } from "./FeedbackView";
import { InterviewHeader } from "./InterviewHeader";
import { LoadingState } from "./LoadingState";

const TOTAL_QUESTIONS = 5;

export default function InterviewComponent({ interviewId }: { interviewId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<InterviewPhaseEnum>(InterviewPhaseEnum.LOADING);
  const [interview, setInterview] = useState<IInterview | null>(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    ApiClientService.getInterview({ interviewId }).then(({ data, error: err }) => {
      if (err || !data) {
        setError(err ?? "Failed to load interview");
        setPhase(InterviewPhaseEnum.ERROR);
        return;
      }
      setInterview(data);
      setCurrentQIdx(data.current_question_idx);
      setPhase(InterviewPhaseEnum.ANSWERING);
    });
  }, [interviewId]);

  const handleSubmit = async () => {
    if (!answer.trim() || !interview) return;
    setPhase(InterviewPhaseEnum.SUBMITTING);

    const { data, error: err } = await ApiClientService.submitAnswer({ interviewId, answer: answer.trim() });
    if (err || !data) {
      setError(err ?? "Failed to submit answer");
      setPhase(InterviewPhaseEnum.ERROR);
      return;
    }

    setFeedback(data.feedback);
    setPhase(InterviewPhaseEnum.FEEDBACK);
  };

  const transcribeAudio = async () => {
    setIsTranscribing(true);
    setRecordingError(null);
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    audioChunksRef.current = [];
    if (audioBlob.size === 0) {
      setRecordingError("No audio data recorded.");
      setIsTranscribing(false);
      return;
    }
    const { data, error: err } = await ApiClientService.transcribeAudio({ audioBlob });
    if (err || !data?.text) {
      setRecordingError(err ?? "Could not transcribe audio. Please try again.");
    } else {
      setAnswer((prev) => (prev ? `${prev} ${data.text}` : data.text));
    }
    setIsTranscribing(false);
  };

  const startRecording = async () => {
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        await transcribeAudio();
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setRecordingError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleNext = async () => {
    if (!interview) return;
    const nextIdx = currentQIdx + 1;

    if (nextIdx >= TOTAL_QUESTIONS) {
      router.push(`/interview/${interviewId}/report`);
    } else {
      setCurrentQIdx(nextIdx);
      setAnswer("");
      setFeedback("");
      setPhase(InterviewPhaseEnum.ANSWERING);
    }
  };

  if (phase === InterviewPhaseEnum.LOADING) return <LoadingState />;
  if (phase === InterviewPhaseEnum.ERROR) return <ErrorState error={error} />;
  if (!interview) return null;

  const currentQuestion = interview.data[currentQIdx]?.question ?? "";
  const isLastQuestion = currentQIdx === TOTAL_QUESTIONS - 1;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        <InterviewHeader
          jobRole={interview.job_role}
          experience={interview.experience}
          currentQIdx={currentQIdx}
          totalQuestions={TOTAL_QUESTIONS}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
          <div className="mb-4">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              Question {currentQIdx + 1}
            </div>
            <p className="text-lg font-semibold leading-relaxed text-slate-900">{currentQuestion}</p>
          </div>

          {(phase === InterviewPhaseEnum.ANSWERING || phase === InterviewPhaseEnum.SUBMITTING) && (
            <AnswerInput
              answer={answer}
              onAnswerChange={setAnswer}
              isSubmitting={phase === InterviewPhaseEnum.SUBMITTING}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              recordingError={recordingError}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onSubmit={handleSubmit}
            />
          )}

          {phase === InterviewPhaseEnum.FEEDBACK && (
            <FeedbackView
              answer={answer}
              feedback={feedback}
              isLastQuestion={isLastQuestion}
              onNext={handleNext}
            />
          )}

          {phase === InterviewPhaseEnum.FETCHING_REPORT && (
            <div className="flex items-center justify-center py-8 gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
              <span className="text-sm">Generating your report...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
