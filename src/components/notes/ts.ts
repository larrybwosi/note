export interface Reference {
  type: 'book' | 'website' | 'article' | 'video';
  title: string;
  author?: string;
  url?: string;
  page?: string;
}

export interface FormattedText {
  text: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    highlight?: string;
    color?: string;
  };
}

// export interface Note {
//   title: string;
//   content: string;
//   formattedContent: FormattedText[];
//   tags: string[];
//   image?: string;
//   category?: string;
//   references: Reference[];
//   lastEdited: Date;
//   reminder?: Date;
//   isBookmarked: boolean;
// }