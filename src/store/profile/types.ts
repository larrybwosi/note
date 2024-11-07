export type Profile = {
  personalInfo: {
    name: string;
    email: string;
    dateOfBirth: string;
    image?: string;
    height: number;
    weight: number;
    phone?: string;
    address?: string;
    gender?: string;
    preferredLanguage?: string;
    emergencyContact?: { name: string; phone: string };
    bloodType?: string;
    allergies?: string[];
    medicalNotes?: string;
    sleepGoal?: number;
    waterIntake?: number;
    calorieGoal?: number;
    storedToken?: string;
  };
  healthMetrics: {
    waterIntake: { daily: { goal: number; current: number } };
    sleep: { averageHours: number; goal: number };
    exercise: { weeklyGoal: number; weeklyProgress: number };
    bodyFatPercentage?: number;
    calorieTracking?: { dailyIntake: number; dailyBurn: number };
    heartRate?: { resting: number; active: number };
    bloodPressure?: { systolic: number; diastolic: number };
    stressLevel?: number;
    customGoals?: { name: string; target: string; progress: number }[];
  };
  productivityMetrics: {
    focusTime: { daily: { goal: number; current: number } };
    habits: { name: string; frequency: 'daily' | 'weekly'; completed: boolean }[];
    pomodoroSessions?: { goal: number; completed: number };
    breakTime?: { total: number };
    taskCompletionRate?: number;
    projects?: { name: string; tasksCompleted: number; totalTasks: number }[];
    journaling?: { lastEntryDate: string; entries: { date: string; content: string }[] };
    schedule: {workStartTime?: Date; workEndTime?: Date; breakDuration?: number;}
  };
  socialMetrics?: {
    friends?: { name: string; progress: number }[];
    leaderboard?: { rank: number; score: number };
  };
  achievements?: {
    badges: { name: string; earnedDate: string }[];
    streaks: { metric: string; count: number };
  };
  systemSettings?: {
    notifications: {reminders?: boolean; waterReminder?: boolean; exerciseReminder?: boolean; sleepReminder?: boolean};
    theme: 'light' | 'dark' | 'system';
    dataExport?: { lastExportDate: string };
    accentColor?: string;
    gradient?: { startColor: string; endColor: string };
  };
};
