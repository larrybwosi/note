import { observable } from '@legendapp/state';
import { Activity, BadgeDollarSign, BookOpenCheck, CalendarDays, Clock, FileDown, Star, Sun } from 'lucide-react-native';

const MOTIVATIONAL_QUOTES = [
  {
    quote: "Every morning we are born again. What we do today matters most.",
    author: "Buddha"
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Your potential is the sum of all the possibilities God has for your life.",
    author: "Joel Osteen"
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  }
];

const quickActions = [
  {
    icon: <FileDown size={24} color="white" />,
    title: 'Tasks',
    count: '12 pending',
    color: '#FF6B6B',
    description: 'Track and complete your daily goals',
    route: "/tasks"
  },
  {
    icon: <CalendarDays size={24} color="white" />,
    title: 'Events',
    count: '2 today',
    color: '#4ECDC4',
    description: 'Stay on top of your schedule',
  },
  {
    icon: <Activity size={24} color="white" />,
    title: 'Workouts',
    count: '3 this week',
    color: '#45B7D1',
    description: 'Keep your health goals on track',
  },
  {
    icon: <BadgeDollarSign size={24} color="white" />,
    title: 'Expenses',
    count: '$420 saved',
    color: '#96CEB4',
    description: 'Monitor your financial progress',
  },
];

interface FocusTip {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string[];
}

export const enhancedFocusTips: FocusTip[] = [
  {
    icon: <Clock size={24} color="white" />,
    title: 'Peak Focus Time',
    description: 'Your most productive hours are between 10:00 AM - 12:00 PM. Schedule important tasks during this window for maximum efficiency.',
    gradient: ['#FF9A3D', '#FF6B6B', '#FF8E8E'],
  },
  {
    icon: <Sun size={24} color="white" />,
    title: 'Energy Level',
    description: 'Current energy level is high. Perfect time to tackle challenging tasks or engage in creative problem-solving.',
    gradient: ['#06b6d4', '#4ECDC4', '#45B7D1'],
  },
  {
    icon: <Star size={24} color="white" />,
    title: 'Productivity Streak',
    description: "You've maintained your productivity streak for 7 days! Your consistency is paying off. Keep up the great work!",
    gradient: ['#FFD93D', '#FF9A3D'],
  },
  {
    icon: <BookOpenCheck size={24} color="white" />,
    title: 'Learning Opportunity',
    description: 'You have 30 minutes of free time at 3 PM. Consider using this for a quick learning session or skill development.',
    gradient: ['#6C5CE7', '#A29BFE'],
  },
  {
    icon: <Clock size={24} color="white" />,
    title: 'Time Blocking',
    description: 'Try the Pomodoro Technique today: 25 minutes of focused work followed by a 5-minute break. It can boost your productivity.',
    gradient: ['#FF8008', '#FFC837'],
  },
  {
    icon: <Activity size={24} color="white" />,
    title: 'Progress Insight',
    description: "You're 15% more productive this week compared to last. Your efforts in time management are showing results!",
    gradient: ['#11998E', '#38EF7D'],
  },
];
const homeState = observable({
  nextWaterTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  achievements: {
    tasksCompleted: 7,
    waterStreak: 5,
    focusTime: 120,
  },
});

export {MOTIVATIONAL_QUOTES, quickActions, homeState};