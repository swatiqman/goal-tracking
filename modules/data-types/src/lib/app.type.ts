export interface GoalModel {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  milestones: MilestoneModel[];
}

export interface MilestoneModel {
  id: number;
  title: string;
  dueDate?: Date;
  completed: boolean;
  comments?: CommentModel[];
}

export interface CommentModel {
  id: number;
  text: string;
  date: Date;
}