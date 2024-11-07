import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observable } from '@legendapp/state';

const motivationalQuotes = [
  {
    quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
  },
  {
    quote: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: 'Steve Jobs',
  },
];

const quickActions = [
  {
    icon: <Feather name="list" size={24} color="white" />,
    title: 'Tasks',
    count: '12 pending',
    color: '#FF6B6B',
    description: 'Track and complete your daily goals',
    route: "/tasks"
  },
  {
    icon: <Feather name="calendar" size={24} color="white" />,
    title: 'Events',
    count: '2 today',
    color: '#4ECDC4',
    description: 'Stay on top of your schedule',
  },
  {
    icon: <Feather name="activity" size={24} color="white" />,
    title: 'Workouts',
    count: '3 this week',
    color: '#45B7D1',
    description: 'Keep your health goals on track',
  },
  {
    icon: <Feather name="dollar-sign" size={24} color="white" />,
    title: 'Expenses',
    count: '$420 saved',
    color: '#96CEB4',
    description: 'Monitor your financial progress',
  },
];

const focusTips = [
  {
    icon: '🎯',
    title: 'Peak Focus Time',
    description:
      'Your most productive hours are between 10:00 AM - 12:00 PM. Schedule important tasks during this window.',
  },
  {
    icon: '⚡',
    title: 'Energy Level',
    description: 'Current energy level is high. Perfect time to tackle challenging tasks!',
  },
  {
    icon: '🌟',
    title: 'Daily Streak',
    description: "You've maintained your productivity streak for 7 days! Keep it up!",
  },
] 

interface FocusTip {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string[];
}

export const enhancedFocusTips: FocusTip[] = [
  {
    icon: <Feather name="clock" size={24} color="white" />,
    title: 'Peak Focus Time',
    description: 'Your most productive hours are between 10:00 AM - 12:00 PM. Schedule important tasks during this window for maximum efficiency.',
    gradient: ['#FF9A3D', '#FF6B6B', '#FF8E8E'],
  },
  {
    icon: <Feather name="sun" size={24} color="white" />,
    title: 'Energy Level',
    description: 'Current energy level is high. Perfect time to tackle challenging tasks or engage in creative problem-solving.',
    gradient: ['#06b6d4', '#4ECDC4', '#45B7D1'],
  },
  {
    icon: <Ionicons name="star" size={24} color="white" />,
    title: 'Productivity Streak',
    description: "You've maintained your productivity streak for 7 days! Your consistency is paying off. Keep up the great work!",
    gradient: ['#FFD93D', '#FF9A3D'],
  },
  {
    icon: <Feather name="book-open" size={24} color="white" />,
    title: 'Learning Opportunity',
    description: 'You have 30 minutes of free time at 3 PM. Consider using this for a quick learning session or skill development.',
    gradient: ['#6C5CE7', '#A29BFE'],
  },
  {
    icon: <Feather name="clock" size={24} color="white" />,
    title: 'Time Blocking',
    description: 'Try the Pomodoro Technique today: 25 minutes of focused work followed by a 5-minute break. It can boost your productivity.',
    gradient: ['#FF8008', '#FFC837'],
  },
  {
    icon: <Feather name="activity" size={24} color="white" />,
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

export {motivationalQuotes, quickActions, focusTips, homeState};