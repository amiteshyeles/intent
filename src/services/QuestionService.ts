import { QuestionBank } from '../types';
import { QUESTION_BANKS, getRandomQuestion, getContextualQuestion } from '../data/questions';
import StorageService from './StorageService';

class QuestionService {
  private static instance: QuestionService;
  private storage: StorageService;

  private constructor() {
    this.storage = StorageService.getInstance();
  }

  public static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  /**
   * Get a random question from the specified category, avoiding recently used questions
   */
  async getRandomQuestion(
    category: keyof QuestionBank = 'default',
    avoidRecent: boolean = true
  ): Promise<string> {
    if (avoidRecent) {
      const recentQuestions = await this.storage.getRecentQuestions(7); // Last 7 days
      const availableQuestions = QUESTION_BANKS[category].filter(
        q => !recentQuestions.includes(q)
      );
      
      if (availableQuestions.length === 0) {
        // If all questions have been used recently, fall back to all questions
        return getRandomQuestion(category);
      }
      
      return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    
    return getRandomQuestion(category);
  }

  /**
   * Get a contextual question based on time of day and app type
   */
  getContextualQuestion(
    category: keyof QuestionBank = 'default',
    appName: string
  ): string {
    const hour = new Date().getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' = 'afternoon';
    
    if (hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 18) {
      timeOfDay = 'evening';
    }
    
    return getContextualQuestion(category, appName, timeOfDay);
  }

  /**
   * Get a smart question based on user's patterns and context
   */
  async getSmartQuestion(
    category: keyof QuestionBank = 'default',
    appName: string,
    userId?: string
  ): Promise<string> {
    const globalSettings = await this.storage.loadGlobalSettings();
    
    // If question rotation is disabled, use simple random selection
    if (!globalSettings.questionRotationEnabled) {
      return await this.getRandomQuestion(category, false);
    }
    
    // Get recent questions to avoid repetition
    const recentQuestions = await this.storage.getRecentQuestions(14); // Last 2 weeks
    
    // Get time-based context
    const hour = new Date().getHours();
    const isWorkHours = hour >= 9 && hour <= 17;
    const isEvening = hour >= 18;
    const isMorning = hour < 12;
    
    // Smart category selection based on context
    let smartCategory = category;
    
    if (isWorkHours && category === 'default') {
      smartCategory = 'productivity';
    } else if (isEvening && category === 'default') {
      smartCategory = 'gratitude';
    } else if (isMorning && category === 'default') {
      smartCategory = 'mindfulness';
    }
    
    // Get questions from the smart category
    const questions = QUESTION_BANKS[smartCategory];
    const availableQuestions = questions.filter(q => !recentQuestions.includes(q));
    
    if (availableQuestions.length === 0) {
      // Fall back to contextual question
      return this.getContextualQuestion(category, appName);
    }
    
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  }

  /**
   * Get a question specifically for bypass situations
   */
  getBypassQuestion(appName: string): string {
    const bypassQuestions = [
      `What specific task do you need to accomplish on ${appName}?`,
      `How long do you plan to spend on ${appName}?`,
      `What will you do after using ${appName}?`,
      `Is there a more productive way to accomplish your goal?`,
      `What are you hoping to achieve by opening ${appName}?`,
    ];
    
    return bypassQuestions[Math.floor(Math.random() * bypassQuestions.length)];
  }

  /**
   * Get a reflection question for post-app usage
   */
  getPostReflectionQuestion(appName: string, timeSpent: number): string {
    const postQuestions = [
      `How do you feel after using ${appName}?`,
      `Did you accomplish what you intended on ${appName}?`,
      `What would you like to do next?`,
      `How was your experience with ${appName} just now?`,
      `What did you learn or discover?`,
    ];
    
    return postQuestions[Math.floor(Math.random() * postQuestions.length)];
  }

  /**
   * Mark a question as used and store it in history
   */
  markQuestionAsUsed(
    question: string,
    appName: string,
    completed: boolean = true
  ): void {
    const history = {
      questionId: this.generateQuestionId(question),
      question,
      answeredAt: new Date(),
      appName,
      completed,
    };
    
    this.storage.saveQuestionHistory(history);
  }

  /**
   * Get question effectiveness metrics
   */
  async getQuestionEffectiveness(question: string): Promise<{
      totalShown: number;
      completionRate: number;
      averageEngagement: number;
  }> {
    const history = await this.storage.loadQuestionHistory();
    const questionHistory = history.filter(h => h.question === question);
    
    if (questionHistory.length === 0) {
      return { totalShown: 0, completionRate: 0, averageEngagement: 0 };
    }
    
    const completedCount = questionHistory.filter(h => h.completed).length;
    const completionRate = completedCount / questionHistory.length;
    
    // Simple engagement metric (could be enhanced)
    const averageEngagement = completionRate * 100;
    
    return {
      totalShown: questionHistory.length,
      completionRate,
      averageEngagement,
    };
  }

  /**
   * Get the most effective questions
   */
  async getMostEffectiveQuestions(limit: number = 5): Promise<Array<{
    question: string;
    effectiveness: number;
    totalShown: number;
  }>> {
    const history = await this.storage.loadQuestionHistory();
    const questionStats = new Map<string, { completed: number; total: number }>();
    
    history.forEach(h => {
      const stats = questionStats.get(h.question) || { completed: 0, total: 0 };
      stats.total++;
      if (h.completed) {
        stats.completed++;
      }
      questionStats.set(h.question, stats);
    });
    
    const effectiveness = Array.from(questionStats.entries())
      .map(([question, stats]) => ({
        question,
        effectiveness: stats.completed / stats.total,
        totalShown: stats.total,
      }))
      .filter(item => item.totalShown >= 3) // Only include questions shown at least 3 times
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, limit);
    
    return effectiveness;
  }

  /**
   * Get questions that need more data
   */
  async getQuestionsNeedingData(limit: number = 5): Promise<string[]> {
    const history = await this.storage.loadQuestionHistory();
    const questionCounts = new Map<string, number>();
    
    history.forEach(h => {
      questionCounts.set(h.question, (questionCounts.get(h.question) || 0) + 1);
    });
    
    // Get all questions and find those with less than 3 uses
    const allQuestions = [
      ...QUESTION_BANKS.default,
      ...QUESTION_BANKS.gratitude,
      ...QUESTION_BANKS.productivity,
      ...QUESTION_BANKS.mindfulness,
    ];
    
    const questionsNeedingData = allQuestions
      .filter(q => (questionCounts.get(q) || 0) < 3)
      .slice(0, limit);
    
    return questionsNeedingData;
  }

  /**
   * Generate a unique ID for a question
   */
  private generateQuestionId(question: string): string {
    return question.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  }
}

export default QuestionService; 