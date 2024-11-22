import { Category } from "src/store/notes/types";

export const categories: Category[] = [
  { id: '1', name: 'Class Notes', icon: 'school', color: "#d8b4fe" },
  { id: '2', name: 'Meeting Notes', icon: 'business', color: "#93c5fd" },
  { id: '3', name: 'Research', icon: 'science', color:"#fef08a" },
  { id: '4', name: 'Journal', icon: 'book', color: "#fda4af"},
  { id: '5', name: 'Project', icon: 'assignment', color: "#bef264"},
];

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