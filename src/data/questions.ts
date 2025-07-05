import { QuestionBank } from '../types';

export const QUESTION_BANKS: QuestionBank = {
  gratitude: [
    "What is something you are grateful for today?",
    "Who in your life brings you joy?",
    "What small moment made you smile recently?",
    "What is working well in your life right now?",
    "What good thing happened to you this week?",
    "What skill or ability are you thankful to have?",
    "What place makes you feel peaceful?",
    "What relationship in your life are you most grateful for?",
  ],
  
  productivity: [
    "What is something you are looking forward to doing today?",
    "What is something you have to get done today?",
    "What is something you are pushing off?",
    "What would make today feel successful?",
    "What is one thing you could do right now to feel more accomplished?",
    "What project would you like to make progress on?",
    "What skill would you like to develop this week?",
    "What deadline is coming up that you should focus on?",
    "What task would give you the most satisfaction to complete?",
    "What would your future self thank you for doing right now?",
  ],
  
  mindfulness: [
    "How are you feeling right now?",
    "What is something you are going to do this evening?",
    "How are your parents doing?",
    "What would be a better use of your time right now?",
    "What are you avoiding by reaching for your phone?",
    "How is your energy level today?",
    "What does your body need right now?",
    "What emotion are you trying to avoid or escape?",
    "When did you last take a deep breath?",
    "What would help you feel more centered?",
    "What conversation have you been meaning to have?",
    "How connected do you feel to the people around you?",
  ],
  
  default: [
    "Why are you opening this app?",
    "What are you hoping to find?",
    "Is there something more important you could do?",
    "What are you curious about right now?",
    "What would you rather be doing?",
    "How long do you plan to spend here?",
    "What will you gain from this?",
    "Is this the best use of your time?",
  ],
};

export const getRandomQuestion = (
  category: keyof QuestionBank = 'default',
  excludeRecent: string[] = []
): string => {
  const questions = QUESTION_BANKS[category];
  const availableQuestions = questions.filter(q => !excludeRecent.includes(q));
  
  if (availableQuestions.length === 0) {
    // If all questions have been used recently, fall back to all questions
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
};

export const getContextualQuestion = (
  category: keyof QuestionBank = 'default',
  appName: string,
  timeOfDay: 'morning' | 'afternoon' | 'evening' = 'afternoon'
): string => {
  // Add context-specific logic here
  if (timeOfDay === 'evening' && category === 'productivity') {
    return "What is something you are going to do this evening?";
  }
  
  if (timeOfDay === 'morning' && category === 'mindfulness') {
    return "How are you feeling this morning?";
  }
  
  return getRandomQuestion(category);
}; 