

export const colorSchemes = {
  research: {
    gradient: ['#4158D0', '#C850C0'],
    accent: '#8B5CF6',
  },
  project: {
    gradient: ['#0093E9', '#80D0C7'],
    accent: '#3B82F6',
  },
  class: {
    gradient: ['#8EC5FC', '#E0C3FC'],
    accent: '#6366F1',
  },
  personal: {
    gradient: ['#FAD961', '#F76B1C'],
    accent: '#F59E0B',
  },
  ideas: {
    gradient: ['#84FAB0', '#8FD3F4'],
    accent: '#10B981',
  }
} as const;

export const themes = {
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

export type NoteCategory = keyof typeof colorSchemes;

export interface Reference {
  type: 'book' | 'website' | 'article' | 'video';
  title: string;
  author?: string;
  url?: string;
  page?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: NoteCategory;
  references: Reference[];
  lastEdited: Date;
  isBookmarked: boolean;
}

export type DefaultNoteCategory = 'personal' | 'work' | 'study' | 'other';
export type DefaultReferenceType = 'book' | 'website' | 'article' | 'video';

export interface BaseReference<T extends string = DefaultReferenceType> {
  type: T;
  title: string;
  author?: string;
  url?: string;
  page?: string | number;
}

export type CustomReference<T extends string> = BaseReference<T> & Record<string, unknown>;

export interface BaseNote<C extends string = DefaultNoteCategory, R extends string = DefaultReferenceType> {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: C;
  references: BaseReference<R>[];
  lastEdited: Date;
  isBookmarked: boolean;
}

export type CustomNote<
  C extends string = DefaultNoteCategory,
  R extends string = DefaultReferenceType,
  CustomFields extends Record<string, unknown> = {}
> = BaseNote<C, R> & CustomFields;

export type NoteStore<
  C extends string = DefaultNoteCategory,
  R extends string = DefaultReferenceType,
  CustomFields extends Record<string, unknown> = {}
> = {
  notes: CustomNote<C, R, CustomFields>[];
  categories: C[];
  referenceTypes: R[];
};









interface ElementType {
  type: 'bullet' | 'numbered' | 'checkbox' | 'link' | 'mention' | 'comment' | 'reference' | 'text';
  content: string;
  url?: string;
  checked?: boolean;
}

const parseContent = (text: string, noteType: 'todo' | 'list' | 'note'): ElementType[][] => {
  const lines = text?.split('\n');
  return lines.map(line => {
    const parts: ElementType[] = [];
    
    // Parse different elements based on note type
    const checkForSpecialElements = (text: string) => {
      const linkRegex = /\[(.*?)\]$$(.*?)$$/g;
      const mentionRegex = /@(\w+)/g;
      const commentRegex = /\/\/(.*?)$/g;
      const referenceRegex = /#(\w+)/g;
      
      let modifiedText = text;
      
      modifiedText = modifiedText.replace(linkRegex, (match, text, url) => {
        parts.push({ type: 'link', content: text, url });
        return '';
      });
      
      modifiedText = modifiedText.replace(mentionRegex, (match, username) => {
        parts.push({ type: 'mention', content: username });
        return '';
      });
      
      modifiedText = modifiedText.replace(commentRegex, (match, comment) => {
        parts.push({ type: 'comment', content: comment });
        return '';
      });
      
      modifiedText = modifiedText.replace(referenceRegex, (match, reference) => {
        parts.push({ type: 'reference', content: reference });
        return '';
      });
      
      if (modifiedText) {
        parts.push({ type: 'text', content: modifiedText });
      }
    };
    
    if (noteType === 'todo' && line.trim().startsWith('- [ ]')) {
      parts.push({ type: 'checkbox', content: line.slice(5), checked: false });
    } else if (noteType === 'todo' && line.trim().startsWith('- [x]')) {
      parts.push({ type: 'checkbox', content: line.slice(5), checked: true });
    } else if (noteType === 'list' && line.trim().startsWith('- ')) {
      parts.push({ type: 'bullet', content: line.slice(2) });
    } else if (noteType === 'list' && line.trim().match(/^\d+\./)) {
      parts.push({ type: 'numbered', content: line.slice(line.indexOf('.') + 1) });
    } else {
      checkForSpecialElements(line);
    }
    
    return parts;
  });
};

// const mockNotes: Note[] = [
  //       {
  //         id: '1',
  //         title: 'Research: AI in Healthcare',
  //         content: 'Recent developments in AI are revolutionizing healthcare diagnostics...',
  //         tags: ['AI', 'healthcare', 'research'],
  //         category: 'research',
  //         lastEdited: new Date(),
  //         isBookmarked: true,
  //       },
  //       {
  //         id: '2',
  //         title: 'Project: Mobile App Architecture',
  //         content: 'Key considerations for scalable mobile architecture...',
  //         tags: ['mobile', 'architecture', 'development'],
  //         category: 'project',
  //         lastEdited: new Date(),
  //         isBookmarked: false,
  //       },
  //       {
  //         id: '3',
  //         title: 'Advanced Data Structures',
  //         content: 'Notes from today\'s lecture on balanced trees and heap implementations...',
  //         tags: ['CS', 'algorithms', 'study'],
  //         category: 'class',
  //         lastEdited: new Date(),
  //         isBookmarked: true,
  //       },
  //     ];