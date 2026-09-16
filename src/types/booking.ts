export interface BookedStudent {
  username: string;
  name: string;
  role: string;
  bookedAt: string;
}

export interface BookingSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  title: string;
  teacherName?: string;
  targetGrade?: string; // เช่น "ม.3" หรือ "ทุกระดับชั้น"
  notes?: string;
  bookedStudents: BookedStudent[];
  createdBy: string;
  createdAt: string;
}
