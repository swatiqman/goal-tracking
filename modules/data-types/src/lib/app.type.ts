export interface Goal {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  milestones: Milestone[];
}

export interface Milestone {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  comments: Comment[];
}

export interface Comment {
  id: number;
  text: string;
  author: string;
  date: Date;
}