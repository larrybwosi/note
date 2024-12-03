import { Book, Building2Icon, ClipboardPenLine, FlaskConical, GraduationCap } from "lucide-react-native";
import { Category, ColorScheme } from "./types";

export interface ThemeColors {
  readonly background: string;
  readonly text: string;
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly border: string;
  readonly cardBg: string;
  readonly error: string;
  readonly success: string;
}

export const THEME_MODES = ['light', 'dark'] as const;
export type ThemeMode = typeof THEME_MODES[number];

// Theme configuration with type safety
export const themes: Readonly<Record<ThemeMode, ThemeColors>> = {
  light: {
    background: '#ffffff',
    text: '#1F2937',
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#8B5CF6',
    border: '#E5E7EB',
    cardBg: '#F9FAFB',
    error: '#EF4444',
    success: '#10B981',
  },
  dark: {
    background: '#111827',
    text: '#F9FAFB',
    primary: '#60A5FA',
    secondary: '#3B82F6',
    accent: '#8B5CF6',
    border: '#374151',
    cardBg: '#1F2937',
    error: '#EF4444',
    success: '#10B981',
  },
} as const;

// Category color schemes with type safety
export const categoryColorSchemes: Readonly<Record<string, ColorScheme>> = {
  research: {
    gradient: ['#4158D0', '#C850C0'],
    accent: '#8B5CF6',
  },
  project: {
    gradient: ['#8EC5FC', '#E0C3FC'],
    accent: '#6366F1',
  },
  class: {
    gradient: ['#0093E9', '#80D0C7'],
    accent: '#3B82F6',
  },
  personal: {
    gradient: ['#FAD961', '#F76B1C'],
    accent: '#F59E0B',
  },
  ideas: {
    gradient: ['#84FAB0', '#8FD3F4'],
    accent: '#10B981',
  },
} as const;

// Predefined categories with type safety
export const categories: readonly Category[] = [
  {
    id: '1',
    name: 'Class Notes',
    icon: GraduationCap,
    color: '#4F46E5',
    colorScheme: categoryColorSchemes.class,
  },
  {
    id: '2',
    name: 'Personal',
    icon: ClipboardPenLine,
    color: '#EA580C',
    colorScheme: categoryColorSchemes.personal,
  },
  {
    id: '3',
    name: 'Meeting Notes',
    icon: Building2Icon,
    color: '#0891B2',
    colorScheme: categoryColorSchemes.project,
  },
  {
    id: '4',
    name: 'Research',
    icon: FlaskConical,
    color: '#059669',
    colorScheme: categoryColorSchemes.research,
  },
  {
    id: '5',
    name: 'Journal',
    icon: Book,
    color: '#8B5CF6',
    colorScheme: categoryColorSchemes.personal,
  },
] as const;

export const tagOptions = [
  { id: '1', name: 'Important', color: 'bg-red-500' },
  { id: '2', name: 'Review', color: 'bg-yellow-500' },
  { id: '3', name: 'Quiz', color: 'bg-purple-500' },
  { id: '4', name: 'Homework', color: 'bg-blue-500' },
  { id: '5', name: 'Research', color: 'bg-green-500' },
];

export const highlightColors = [
  '#fef08a', // yellow
  '#bef264', // green
  '#93c5fd', // blue
  '#fda4af', // red
  '#d8b4fe', // purple
];