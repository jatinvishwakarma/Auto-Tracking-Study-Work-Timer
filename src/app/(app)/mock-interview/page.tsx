"use client";

import { useState } from "react";
import { Play, CheckCircle2, ChevronRight, RotateCcw, AlertCircle } from "lucide-react";

type InterviewQuestion = {
  id: string;
  category: string;
  question: string;
  answer: string | null;
  difficulty: string;
};

export default function MockInterviewPage() {
  const [sessionActive, setSessionActive] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mock-interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5 })
      });
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setQuestions(json.data);
        setSessionActive(true);
        setCurrentIndex(0);
        setShowAnswer(false);
        setCompleted(false);
      }
    } catch (error) {
      console.error("Failed to generate mock interview");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setCompleted(true);
    }
  };

  const endSession = () => {
    setSessionActive(false);
    setCompleted(false);
    setQuestions([]);
  };

  if (!sessionActive) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-[var(--accent-dim)] rounded-full flex items-center justify-center text-[var(--accent)] mb-4">
          <Play size={40} className="ml-2" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">Mock Interview Simulator</h1>
        <p className="text-[var(--text-muted)] max-w-lg text-lg">
          Test your readiness with a randomized set of 5 questions spanning Data Structures, System Design, Java, SQL, and Behavioral topics.
        </p>
        
        <button 
          onClick={startSession}
          disabled={loading}
          className="btn btn-primary text-lg px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          {loading ? "Generating Session..." : "Start Mock Interview"}
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <CheckCircle2 size={80} className="text-[var(--success)] mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">Interview Completed!</h1>
        <p className="text-[var(--text-muted)] text-lg">
          Great job! Consistency is the key to cracking the interview.
        </p>
        <div className="flex gap-4 mt-8">
          <button onClick={startSession} className="btn btn-primary">Start Another</button>
          <button onClick={endSession} className="btn btn-secondary">Exit to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <span className="text-[var(--accent)] font-semibold text-sm tracking-wider uppercase">Question {currentIndex + 1} of {questions.length}</span>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">{currentQ.category}</h2>
        </div>
        <button onClick={endSession} className="text-[var(--error)] hover:bg-[var(--error-dim)] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
          End Session
        </button>
      </header>

      <div className="w-full bg-[var(--bg-elevated)] h-2 rounded-full overflow-hidden">
        <div 
          className="bg-[var(--accent)] h-full transition-all duration-500 ease-out" 
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        />
      </div>

      <div className="card p-6 md:p-10 min-h-[400px] flex flex-col">
        <div className="flex-1 space-y-8">
          <div>
            <h3 className="text-2xl font-bold leading-relaxed text-[var(--text-primary)]">
              {currentQ.question}
            </h3>
          </div>

          {showAnswer ? (
            <div className="p-6 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] relative animate-in fade-in slide-in-from-bottom-4">
              <div className="absolute -top-3 left-6 bg-[var(--bg-elevated)] px-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Suggested Answer
              </div>
              <div className="whitespace-pre-wrap text-[var(--text-secondary)] leading-relaxed">
                {currentQ.answer || <span className="italic text-[var(--text-faint)]">No suggested answer available.</span>}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-faint)] space-y-4 py-12">
              <AlertCircle size={48} className="opacity-20" />
              <p>Take a moment to formulate your answer out loud.</p>
            </div>
          )}
        </div>

        <div className="pt-8 mt-auto flex justify-between items-center border-t border-[var(--border)]">
          {!showAnswer ? (
            <button 
              onClick={() => setShowAnswer(true)}
              className="btn btn-secondary w-full justify-center py-3 text-base"
            >
              Reveal Answer
            </button>
          ) : (
            <div className="w-full flex gap-4">
              <button 
                onClick={() => { /* In a real app, this could log confidence */ nextQuestion(); }}
                className="btn btn-secondary flex-1 justify-center py-3 text-base text-[var(--error)] hover:bg-[var(--error-dim)]"
              >
                Needs Practice
              </button>
              <button 
                onClick={nextQuestion}
                className="btn btn-primary flex-1 justify-center py-3 text-base bg-[var(--success)] hover:bg-[var(--success)]/90"
              >
                Nailed it <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
