import { User } from '@/types/auth';
import { HomeworkItem } from '@/types/homework';
import { BookingSlot } from '@/types/booking';

export const GOOGLE_SCRIPT_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbzXfI1ecDf69ekj5rFa82ARYFaAnlXyB8UJj_7hg5dEZiHKAbHcPTScWIo4nEUidJK5qQ/exec';

export const MOCK_ACCOUNTS: Record<string, { password: string; user: User }> = {
  teacher: {
    password: 'bj3111',
    user: {
      username: 'teacher',
      name: 'คุณครูสมศรี ใจดี',
      role: 'teacher',
      roleTitle: 'คุณครูประจำวิชา / ที่ปรึกษา',
      grade: 'ทุกระดับชั้น',
      room: 'ทุกห้อง',
      classLabel: 'อาจารย์ที่ปรึกษา',
      avatarBg: 'from-blue-600 to-indigo-600',
    },
  },
  leader: {
    password: 'bj3222',
    user: {
      username: 'leader',
      name: 'กิตติศักดิ์ พรหมมา',
      role: 'leader',
      roleTitle: 'หัวหน้าห้อง',
      grade: 'ม.3',
      room: '13',
      classLabel: 'ม.3/13',
      studentId: '31301',
      avatarBg: 'from-sky-500 to-blue-600',
    },
  },
  student: {
    password: 'bj3333',
    user: {
      username: 'student',
      name: 'ณภัทร วงศ์สว่าง',
      role: 'student',
      roleTitle: 'นักเรียน',
      grade: 'ม.3',
      room: '13',
      classLabel: 'ม.3/13',
      studentId: '31315',
      avatarBg: 'from-teal-400 to-sky-500',
    },
  },
};

export const USER_ALIASES: Record<string, 'teacher' | 'leader' | 'student'> = {
  // ครู
  'ครู': 'teacher',
  'คุณครู': 'teacher',
  'teacher': 'teacher',
  // หัวหน้าห้อง
  'หัวหน้าห้อง': 'leader',
  'หัวหน้า': 'leader',
  'leader': 'leader',
  // นักเรียน
  'นักเรียน': 'student',
  'student': 'student',
};

export const INITIAL_HOMEWORK: HomeworkItem[] = [];

export const INITIAL_BOOKINGS: BookingSlot[] = [];

