export type UserRole = 'teacher' | 'leader' | 'student';

export interface User {
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  grade?: string; // เช่น "ม.3"
  room?: string;  // เช่น "13"
  classLabel?: string; // เช่น "ม.3/13" หรือ "ครูประจำหมวด"
  studentId?: string;
  avatarBg?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
    extra?: { fullName?: string; grade?: string; room?: string }
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}
