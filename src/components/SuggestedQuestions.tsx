"use client";

import { User, Code, Target, Heart } from "lucide-react";

interface SuggestedQuestion {
  category: string;
  icon: React.ReactNode;
  questions: string[];
}

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    category: "GET TO KNOW ME",
    icon: <User className="h-5 w-5 text-blue-500" />,
    questions: [
      "Tell me about yourself",
      "What are you looking for in your next role?",
    ],
  },
  {
    category: "TECHNICAL SKILLS",
    icon: <Code className="h-5 w-5 text-blue-500" />,
    questions: [
      "Diagram the Ask My AI chat architecture",
      "Tell me about a complex system you've built",
    ],
  },
  {
    category: "BEHAVIORAL",
    icon: <Target className="h-5 w-5 text-blue-500" />,
    questions: [
      "Tell me about a time you led a challenging project",
      "How do you handle disagreements with teammates?",
    ],
  },
  {
    category: "FUN STUFF",
    icon: <Heart className="h-5 w-5 text-blue-500" />,
    questions: [
      "What are your hobbies outside of work?",
      "Tell me a fun story about yourself",
    ],
  },
];

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

export function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-500 sm:text-sm">
          ASK ME ABOUT
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {SUGGESTED_QUESTIONS.map((category) => (
          <div key={category.category} className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-700 dark:text-gray-400 sm:gap-2 sm:text-xs">
              <span className="hidden sm:inline">{category.icon}</span>
              <span>{category.category}</span>
            </div>
            <div className="space-y-2">
              {category.questions.map((question) => (
                <button
                  key={question}
                  onClick={() => onQuestionClick(question)}
                  className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-xs text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-300 dark:hover:border-accent dark:hover:bg-gray-900 sm:px-4 sm:py-3 sm:text-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
