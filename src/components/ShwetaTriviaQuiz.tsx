import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { fireReaction } from './FloatingReactionOverlay';
import {
  HelpCircle,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Heart,
  ChevronRight,
  Gift,
  Trophy,
  Smile,
  Edit3,
  Plus,
  Trash2,
  Wand2,
} from 'lucide-react';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  rewardMessage: string;
  category: string;
}

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'When do we celebrate dearest Shweta’s special birthday?',
    options: ['15 August', '25 October', '14 November', '1 January'],
    correctIndex: 1,
    explanation: '25 October is Shweta’s auspicious birthday — a day full of joy and celebrations!',
    rewardMessage: '✨ Exactly right! 25 October is a truly golden day marked for eternal happiness, cake cutting, and Mahadev’s blessings!',
    category: 'Birthday Date 🎂',
  },
  {
    id: 'q2',
    question: 'Which divine deity’s blessings and sacred mantras are dedicated for Shweta’s protection & peace?',
    options: ['Lord Shiva / Mahadev 🕉️', 'Lord Apollo', 'Lord Thor', 'Lord Poseidon'],
    correctIndex: 0,
    explanation: 'Mahadev’s sacred grace (॥ ॐ नमः शिवाय ॥) surrounds Shweta with health, strength, and inner peace.',
    rewardMessage: '🕉️ Har Har Mahadev! You know how sacred Bholenath’s grace is for Shweta. May Lord Shiva forever protect her steps and dreams!',
    category: 'Divine Blessings 🕉️',
  },
  {
    id: 'q3',
    question: 'What is the most cherished, admired trait in Shweta’s personality?',
    options: [
      'Her deeply loving, sweet, and caring nature 🌸',
      'Being completely silent all day',
      'Always eating ice cream for breakfast',
      'Forgetting everyone’s birthdays',
    ],
    correctIndex: 0,
    explanation: 'Her genuine warmth, caring essence, and loving heart make everyone feel treasured.',
    rewardMessage: '💖 Spot on! Shweta’s loving and caring nature is unmatched. "Apki nature aisi hi loving caring rahe aur aapki muskurahat hamesha bani rahe!"',
    category: 'Personality 💖',
  },
  {
    id: 'q4',
    question: 'What is the golden birthday wish for Shweta in this special tribute?',
    options: [
      'That she gets a boring job',
      'Apka mera saath hamesha bane rahe & all her dreams come true ⭐',
      'That it rains every single day',
      'That celebrations end in 5 minutes',
    ],
    correctIndex: 1,
    explanation: 'The heartfelt wish: "Apka mera saath hamesha bane rhe, apki har icha puri ho aur aap jeevan me sab deserve karo!"',
    rewardMessage: '🌟 100% Correct! May your bond remain eternal and unbreakable, and may every dream she holds in her heart turn into reality!',
    category: 'Lifelong Wishes 🤝',
  },
  {
    id: 'q5',
    question: 'How should Shweta spend her birthday celebration?',
    options: [
      'Stressed about everyday chores',
      'Surrounded by immense love, sweet cake, prayers & pure laughter 🎉',
      'Ignoring all calls and messages',
      'Sitting alone in the dark',
    ],
    correctIndex: 1,
    explanation: 'A grand celebration with cake, music, confetti, and heartfelt prayers is what she deserves!',
    rewardMessage: '🎉 Bingo! Shweta deserves all the warmth, surprises, cake cutting, and joyous celebrations the world has to offer!',
    category: 'Celebration Mood 🎈',
  },
];

interface ShwetaTriviaQuizProps {
  recipientName?: string;
}

export const ShwetaTriviaQuiz: React.FC<ShwetaTriviaQuizProps> = ({
  recipientName = 'Shweta',
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('shweta_trivia_questions');
      return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
    } catch {
      return DEFAULT_QUESTIONS;
    }
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const currentQ = questions[currentIdx];

  // Save customized questions if updated
  const saveQuestions = (updated: QuizQuestion[]) => {
    setQuestions(updated);
    try {
      localStorage.setItem('shweta_trivia_questions', JSON.stringify(updated));
    } catch {
      // safe
    }
  };

  const handleGenerateAITrivia = async (e?: React.MouseEvent) => {
    if (isGeneratingAI) return;
    setIsGeneratingAI(true);
    sound.playChime(660, 0.3);

    try {
      const res = await fetch('/api/trivia/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: recipientName }),
      });
      const data = await res.json();

      if (data && data.question) {
        const newQ: QuizQuestion = data.question;
        const updated = [...questions, newQ];
        saveQuestions(updated);
        setCurrentIdx(updated.length - 1);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setQuizCompleted(false);

        sound.playChime(880, 0.4);
        fireReaction({
          event: e,
          count: 8,
          type: 'sparkle',
          label: `✨ New AI Trivia Question Added for ${recipientName}!`,
        });
      }
    } catch (err) {
      console.error('Failed to generate AI trivia question:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = (e: React.MouseEvent) => {
    if (selectedOption === null || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctIndex;

    if (isCorrect) {
      sound.playChime(880, 0.4);
      setScore((prev) => prev + 1);
      setUnlockedRewards((prev) => [...prev, currentQ.rewardMessage]);

      fireReaction({
        event: e,
        count: 7,
        type: 'sparkle',
        label: `🎉 Correct! Personalized Reward Unlocked for ${recipientName}!`,
      });

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#FFB3B3', '#8B5E3C', '#FFDBA4', '#C1E1C1'],
      });
    } else {
      sound.playChime(350, 0.25);
      fireReaction({
        event: e,
        count: 3,
        type: 'heart',
        label: 'Almost! Love and blessings sent anyway 💖',
      });
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      sound.playChime(600, 0.2);
    } else {
      setQuizCompleted(true);
      sound.playChime(1046, 0.6);
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FFB3B3', '#8B5E3C', '#FFDBA4', '#C1E1C1', '#FFA502'],
      });
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    setUnlockedRewards([]);
    sound.playChime(523, 0.3);
  };

  const getScoreVerdict = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) {
      return {
        badge: '🏆 Ultimate Soulmate & True Well-Wisher',
        title: `Perfect 100%! You know ${recipientName} like nobody else!`,
        desc: `You know every single detail about ${recipientName}'s birthday, her spiritual reverence for Mahadev, and her caring spirit! May your bond shine eternally!`,
      };
    } else if (percentage >= 60) {
      return {
        badge: '⭐ Cherished Best Friend of Shweta',
        title: `Superb! You scored ${score}/${questions.length}!`,
        desc: `You hold a very special place in ${recipientName}'s life and understand what makes her smile and feel loved!`,
      };
    } else {
      return {
        badge: '💖 Heartfelt Well-Wisher',
        title: `Wonderful effort! You scored ${score}/${questions.length}!`,
        desc: `Every moment with ${recipientName} is filled with warmth. Here are all the personalized blessings unlocked for her!`,
      };
    }
  };

  return (
    <div
      id="trivia-quiz-section"
      className="w-full max-w-3xl mx-auto my-8 p-6 sm:p-8 rounded-[32px] bg-[#FAF5EF]/90 border border-[#E8D5C4] shadow-md relative overflow-hidden transition-all"
    >
      {/* Background Subtle Floral Watermark */}
      <div className="absolute -top-12 -right-12 text-[#E8D5C4]/30 pointer-events-none text-9xl select-none">
        🌸
      </div>

      {/* Header Section */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E8D5C4]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5E3C]/10 text-[#8B5E3C] text-[11px] font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Birthday Trivia</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#5D4E46]">
            How Well Do You Know {recipientName}? 🌸
          </h3>
          <p className="text-xs sm:text-sm text-[#7D6B60]">
            Answer fun trivia to unlock special personalized blessings & sweet rewards!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          {/* AI Generate Trivia Question Button */}
          <button
            id="btn-generate-ai-trivia"
            onClick={(e) => handleGenerateAITrivia(e)}
            disabled={isGeneratingAI}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#8B5E3C] to-[#A66E43] hover:from-[#704B30] hover:to-[#8B5E3C] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Generate a brand-new trivia question with Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFDBA4]" />
            <span>{isGeneratingAI ? 'Generating...' : '+ AI Question'}</span>
          </button>

          {!quizCompleted && (
            <div className="px-3.5 py-1.5 rounded-full bg-white border border-[#DCC7B5] shadow-xs text-xs font-semibold text-[#8B5E3C] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>
                Score: {score}/{questions.length}
              </span>
            </div>
          )}
          <button
            id="btn-restart-trivia"
            onClick={handleRestartQuiz}
            className="p-2 rounded-full bg-white hover:bg-[#FAF5EF] border border-[#DCC7B5] text-[#8B5E3C] shadow-xs transition-colors cursor-pointer"
            title="Restart Trivia"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Quiz Flow */}
      <div className="relative z-10 mt-6">
        {!quizCompleted ? (
          currentQ && (
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium text-[#8B5E3C]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentQ.category}</span>
                  </span>
                  <span>
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E8D5C4]/60 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FFB3B3] via-[#FFDBA4] to-[#8B5E3C]"
                    initial={{ width: '0%' }}
                    animate={{
                      width: `${((currentIdx + 1) / questions.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question Box */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8D5C4] shadow-xs space-y-4">
                <h4 className="text-lg sm:text-xl font-serif font-semibold text-[#5D4E46] leading-snug">
                  {currentQ.question}
                </h4>

                {/* Options List */}
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.correctIndex;

                    let optionStyle =
                      'bg-[#FAF5EF] border-[#E8D5C4] hover:border-[#8B5E3C] hover:bg-white text-[#5D4E46]';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold shadow-xs';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'bg-red-50 border-red-300 text-red-800 opacity-90';
                      } else {
                        optionStyle = 'bg-[#FAF5EF] border-[#E8D5C4] opacity-50';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-[#8B5E3C]/10 border-[#8B5E3C] text-[#8B5E3C] font-semibold ring-2 ring-[#8B5E3C]/20';
                    }

                    return (
                      <button
                        key={idx}
                        id={`btn-quiz-opt-${currentIdx}-${idx}`}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full p-3.5 sm:p-4 rounded-xl border text-left text-sm transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected || (isAnswerSubmitted && isCorrect)
                                ? 'bg-[#8B5E3C] text-white'
                                : 'bg-white border border-[#DCC7B5] text-[#8B5E3C]'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </div>

                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reward Feedback & Explanation Box */}
              <AnimatePresence>
                {isAnswerSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-5 rounded-2xl border shadow-sm space-y-3 ${
                      selectedOption === currentQ.correctIndex
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                        : 'bg-[#FFF8F0] border-[#E8D5C4] text-[#5D4E46]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      {selectedOption === currentQ.correctIndex ? (
                        <>
                          <Gift className="w-4 h-4 text-emerald-700 animate-bounce" />
                          <span className="text-emerald-800">
                            🎉 Reward Unlocked! Correct Guess:
                          </span>
                        </>
                      ) : (
                        <>
                          <Smile className="w-4 h-4 text-[#8B5E3C]" />
                          <span className="text-[#8B5E3C]">
                            Fun Fact & Blessing:
                          </span>
                        </>
                      )}
                    </div>

                    {/* Personalized Reward Card */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#E8D5C4]/70 shadow-2xs space-y-1.5">
                      <p className="text-xs sm:text-sm font-serif italic text-[#8B5E3C] leading-relaxed">
                        &ldquo;{currentQ.rewardMessage}&rdquo;
                      </p>
                      <p className="text-[11px] text-stone-600">
                        {currentQ.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    id="btn-submit-quiz-answer"
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="px-6 py-2.5 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] disabled:opacity-40 text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span>Check Answer & Unlock Reward</span>
                    <Sparkles className="w-4 h-4 text-[#FFDBA4]" />
                  </button>
                ) : (
                  <button
                    id="btn-next-quiz-question"
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8B5E3C] to-[#A66E43] hover:from-[#704B30] hover:to-[#8B5E3C] text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span>
                      {currentIdx + 1 === questions.length
                        ? 'View Celebration Certificate 🏆'
                        : 'Next Question'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        ) : (
          /* Final Results & Reward Certificate Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8D5C4] shadow-lg text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#FFDBA4] to-[#FFB3B3] flex items-center justify-center text-4xl shadow-inner border-2 border-white animate-bounce">
              🏆
            </div>

            <div className="space-y-2">
              <div className="inline-block px-4 py-1 rounded-full bg-[#FAF5EF] border border-[#E8D5C4] text-[#8B5E3C] text-xs font-bold uppercase tracking-wider">
                {getScoreVerdict().badge}
              </div>
              <h4 className="text-2xl sm:text-3xl font-serif font-bold text-[#5D4E46]">
                {getScoreVerdict().title}
              </h4>
              <p className="text-sm text-[#7D6B60] max-w-lg mx-auto leading-relaxed">
                {getScoreVerdict().desc}
              </p>
            </div>

            {/* Unlocked Personalized Rewards Showcase */}
            <div className="space-y-3 text-left">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#8B5E3C]" />
                <span>All Unlocked Rewards & Heartfelt Notes ({unlockedRewards.length}):</span>
              </h5>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {unlockedRewards.map((reward, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#FAF5EF] border border-[#E8D5C4] text-xs text-[#5D4E46] flex items-start gap-2.5"
                  >
                    <span className="text-base shrink-0">🌸</span>
                    <span className="font-serif italic leading-relaxed">{reward}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#F2E8DF] flex flex-wrap items-center justify-center gap-3">
              <button
                id="btn-play-again-trivia"
                onClick={handleRestartQuiz}
                className="px-5 py-2.5 rounded-full bg-[#FAF5EF] hover:bg-[#F2E8DF] border border-[#DCC7B5] text-[#8B5E3C] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Trivia Again</span>
              </button>

              <button
                id="btn-send-trivia-love"
                onClick={(e) => {
                  sound.playChime(880, 0.4);
                  fireReaction({
                    event: e,
                    count: 10,
                    type: 'heart',
                    label: `💖 Eternal Love & Congratulations sent to ${recipientName}!`,
                  });
                  confetti({
                    particleCount: 50,
                    spread: 80,
                    origin: { y: 0.7 },
                  });
                }}
                className="px-6 py-2.5 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 fill-[#FFB3B3] text-[#FFB3B3]" />
                <span>Send Love & All Unlocked Wishes</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
