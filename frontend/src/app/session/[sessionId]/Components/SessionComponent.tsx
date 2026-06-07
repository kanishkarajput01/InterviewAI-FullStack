"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { type ISession, SessionPhaseEnum } from "@/_shared/types";
import ApiClientService from "@/app/_client-services/ApiService";
import { ErrorState } from "@/app/_shared-components/ErrorState";

import { AnswerInput } from "./AnswerInput";
import { FeedbackView } from "./FeedbackView";
import { LoadingState } from "./LoadingState";
import { SessionHeader } from "./SessionHeader";

const TOTAL_QUESTIONS = 5;

export default function SessionComponent({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<SessionPhaseEnum>(SessionPhaseEnum.LOADING);
  const [session, setSession] = useState<ISession | null>(null);
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
    ApiClientService.getSession({ sessionId }).then(({ data, error: err }) => {
      if (err || !data) {
        setError(err ?? "Failed to load session");
        setPhase(SessionPhaseEnum.ERROR);
        return;
      }
      setSession(data);
      setCurrentQIdx(data.current_question_idx);
      setPhase(SessionPhaseEnum.ANSWERING);
    });
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!answer.trim() || !session) return;
    setPhase(SessionPhaseEnum.SUBMITTING);

    const { data, error: err } = await ApiClientService.submitAnswer({ sessionId, answer: answer.trim() });
    if (err || !data) {
      setError(err ?? "Failed to submit answer");
      setPhase(SessionPhaseEnum.ERROR);
      return;
    }

    setFeedback(data.feedback);
    setPhase(SessionPhaseEnum.FEEDBACK);
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
    if (!session) return;
    const nextIdx = currentQIdx + 1;

    if (nextIdx >= TOTAL_QUESTIONS) {
      router.push(`/session/${sessionId}/report`);
    } else {
      setCurrentQIdx(nextIdx);
      setAnswer("");
      setFeedback("");
      setPhase(SessionPhaseEnum.ANSWERING);
    }
  };

  if (phase === SessionPhaseEnum.LOADING) return <LoadingState />;
  if (phase === SessionPhaseEnum.ERROR) return <ErrorState error={error} />;
  if (!session) return null;

  const currentQuestion = session.data[currentQIdx]?.question ?? "";
  const isLastQuestion = currentQIdx === TOTAL_QUESTIONS - 1;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-x-hidden bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        <SessionHeader
          jobRole={session.job_role}
          experience={session.experience}
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

          {(phase === SessionPhaseEnum.ANSWERING || phase === SessionPhaseEnum.SUBMITTING) && (
            <AnswerInput
              answer={answer}
              onAnswerChange={setAnswer}
              isSubmitting={phase === SessionPhaseEnum.SUBMITTING}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              recordingError={recordingError}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onSubmit={handleSubmit}
            />
          )}

          {phase === SessionPhaseEnum.FEEDBACK && (
            <FeedbackView
              answer={answer}
              feedback={feedback}
              isLastQuestion={isLastQuestion}
              onNext={handleNext}
            />
          )}

          {phase === SessionPhaseEnum.FETCHING_REPORT && (
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
