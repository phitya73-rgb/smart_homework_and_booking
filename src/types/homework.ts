export type HomeworkStatus = 'pending' | 'submitted';

export interface SubmissionRecord {
  username: string;
  name: string;
  classLabel?: string;
  submittedAt: string;
}

export interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
  createdBy: string;
  authorName?: string;
  grade?: string; // เช่น "ม.3"
  room?: string;  // เช่น "13"
  targetClass?: string; // เช่น "ม.3/13"
  // map of username to status ('pending' | 'submitted')
  statusByUser?: Record<string, HomeworkStatus>;
  // full list of students who have submitted
  submissions?: SubmissionRecord[];
}
