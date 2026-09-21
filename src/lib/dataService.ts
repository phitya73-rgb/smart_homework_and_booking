import { HomeworkItem, HomeworkStatus } from '@/types/homework';
import { BookingSlot, BookedStudent } from '@/types/booking';
import { INITIAL_HOMEWORK, INITIAL_BOOKINGS } from '@/lib/constants';
import { User } from '@/types/auth';
import { supabase } from './supabase'; // เพิ่มการเชื่อมต่อ Supabase

const STORAGE_HOMEWORK_KEY = 'homework_app_items_v3';
const STORAGE_BOOKINGS_KEY = 'booking_app_slots_v3';

export const dataService = {
  // --- HOMEWORK ---
  getHomeworkList(): HomeworkItem[] {
    if (typeof window === 'undefined') return INITIAL_HOMEWORK;
    try {
      const stored = localStorage.getItem(STORAGE_HOMEWORK_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_HOMEWORK_KEY, JSON.stringify(INITIAL_HOMEWORK));
    return INITIAL_HOMEWORK;
  },

  async addHomework(
    item: Omit<HomeworkItem, 'id' | 'createdAt' | 'statusByUser'>,
    username: string,
    authorName?: string
  ): Promise<HomeworkItem> {
    const list = this.getHomeworkList();
    const newItem: HomeworkItem = {
      ...item,
      id: 'hw-' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdBy: username,
      authorName: authorName || username,
      statusByUser: {},
    };

    const updated = [newItem, ...list];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_HOMEWORK_KEY, JSON.stringify(updated));
    }

    // 🟢 ส่งข้อมูลไปเก็บบน Supabase (แทน Google Sheets)
    try {
      await supabase.from('homeworks').insert([newItem]);
    } catch (e) {
      console.warn('Supabase API error:', e);
    }

    return newItem;
  },

  async editHomework(updatedItem: HomeworkItem): Promise<HomeworkItem[]> {
    const list = this.getHomeworkList();
    const updated = list.map((item) => (item.id === updatedItem.id ? updatedItem : item));

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_HOMEWORK_KEY, JSON.stringify(updated));
    }

    // 🟢 อัปเดตข้อมูลบน Supabase
    try {
      await supabase.from('homeworks').update(updatedItem).eq('id', updatedItem.id);
    } catch (e) {
      console.warn('Supabase API error:', e);
    }

    return updated;
  },

  async deleteHomework(id: string): Promise<HomeworkItem[]> {
    const list = this.getHomeworkList();
    const updated = list.filter((item) => item.id !== id);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_HOMEWORK_KEY, JSON.stringify(updated));
    }

    // 🟢 ลบข้อมูลบน Supabase
    try {
      await supabase.from('homeworks').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase API error:', e);
    }

    return updated;
  },

  async updateHomeworkStatus(
    id: string,
    username: string,
    status: HomeworkStatus,
    user?: User
  ): Promise<HomeworkItem[]> {
    const list = this.getHomeworkList();
    let updatedItemData: HomeworkItem | null = null;

    const updated = list.map((item) => {
      if (item.id === id) {
        const currentSubmissions = item.submissions || [];
        let newSubmissions = [...currentSubmissions];

        if (status === 'submitted') {
          const existingIdx = newSubmissions.findIndex((s) => s.username === username);
          const studentRecord = {
            username,
            name: user?.name || username,
            classLabel: user?.classLabel || item.targetClass || '',
            submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };
          if (existingIdx >= 0) {
            newSubmissions[existingIdx] = studentRecord;
          } else {
            newSubmissions.push(studentRecord);
          }
        } else {
          newSubmissions = newSubmissions.filter((s) => s.username !== username);
        }

        updatedItemData = {
          ...item,
          statusByUser: {
            ...(item.statusByUser || {}),
            [username]: status,
          },
          submissions: newSubmissions,
        };
        return updatedItemData;
      }
      return item;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_HOMEWORK_KEY, JSON.stringify(updated));
    }

    // 🟢 อัปเดตสถานะการส่งงานไปยัง Supabase
    try {
      if (updatedItemData) {
        await supabase
          .from('homeworks')
          .update({
            statusByUser: updatedItemData.statusByUser,
            submissions: updatedItemData.submissions
          })
          .eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase API error:', e);
    }

    return updated;
  },

  // --- BOOKING SLOTS ---
  getBookingSlots(): BookingSlot[] {
    if (typeof window === 'undefined') return INITIAL_BOOKINGS;
    try {
      const stored = localStorage.getItem(STORAGE_BOOKINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
    return INITIAL_BOOKINGS;
  },

  async addBookingSlot(
    slotData: Omit<BookingSlot, 'id' | 'createdAt' | 'bookedStudents'>,
    username: string
  ): Promise<BookingSlot> {
    const slots = this.getBookingSlots();
    const newSlot: BookingSlot = {
      ...slotData,
      id: 'slot-' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdBy: username,
      bookedStudents: [],
    };

    const updated = [newSlot, ...slots];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
    }

    // 🟢 ส่งข้อมูลรอบจองไป Supabase
    try {
      await supabase.from('booking_slots').insert([newSlot]);
    } catch (e) {
      console.warn('Supabase API error:', e);
    }

    return newSlot;
  },

  async bookSlot(
    slotId: string,
    user: User
  ): Promise<{ success: boolean; message?: string; slots: BookingSlot[] }> {
    const slots = this.getBookingSlots();
    const target = slots.find((s) => s.id === slotId);

    if (!target) {
      return { success: false, message: 'ไม่พบรอบเวลานี้', slots };
    }

    if (target.bookedStudents.some((b) => b.username === user.username)) {
      return { success: false, message: 'คุณได้ทำการจองรอบนี้ไปแล้ว', slots };
    }

    if (target.bookedStudents.length >= target.capacity) {
      return { success: false, message: 'ขออภัย รอบเวลานี้มีผู้จองเต็มแล้ว', slots };
    }

    const displayName = user.classLabel ? ${user.name} (${user.classLabel}) : user.name;

    const newBooking: BookedStudent = {
      username: user.username,
      name: displayName,
      role: user.role,
      bookedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    let updatedBookedStudents: BookedStudent[] = [];

    const updated = slots.map((s) => {
      if (s.id === slotId) {
        updatedBookedStudents = [...s.bookedStudents, newBooking];
        return {
          ...s,
          bookedStudents: updatedBookedStudents,
        };
      }
      return s;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
    }

    // 🟢 บันทึกรายชื่อคนจองไป Supabase
    try {
      await supabase
        .from('booking_slots')
        .update({ bookedStudents: updatedBookedStudents })
        .eq('id', slotId);
    } catch (e) {
      console.warn('Supabase API error:', e);
    }

    return { success: true, slots: updated };
  },

  async cancelBooking(
    slotId: string,
    username: string
  ): Promise<{ success: boolean; slots: BookingSlot[] }> {
    const slots = this.getBookingSlots();
    let remainingStudents: BookedStudent[] = [];

    const updated = slots.map((s) => {
      if (s.id === slotId) {
        remainingStudents = s.bookedStudents.filter((b) => b.username !== username);
        return {
          ...s,
          bookedStudents: remainingStudents,
        };
      }
      return s;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
    }

    // 🟢 อัปเดตรายชื่อเมื่อยกเลิกจองใน Supabase
    try {
      await supabase
        .from('booking_slots')
        .update({ bookedStudents: remainingStudents })
        .eq('id', slotId);
    } catch (e) {
      console.warn('Supabase API error:', e);
    }

    return { success: true, slots: updated };
  },

  async editBookingSlot(updatedSlot: BookingSlot): Promise<BookingSlot[]> {
    const slots = this.getBookingSlots();
    const updated = slots.map((slot) => (slot.id === updatedSlot.id ? updatedSlot : slot));

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
    }

    // 🟢 อัปเดตรอบจองที่แก้ไขใน Supabase
    try {
      await supabase.from('booking_slots').update(updatedSlot).eq('id', updatedSlot.id);
    } catch (e) {
      console.warn('Supabase API error:', e);
    }

    return updated;
  },

  async deleteSlot(slotId: string): Promise<BookingSlot[]> {
    const slots = this.getBookingSlots();
    const updated = slots.filter((s) => s.id !== slotId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
    }
    
    // 🟢 ลบรอบจองใน Supabase
    try {
      await supabase.from('booking_slots').delete().eq('id', slotId);
    } catch (e) {
      console.warn('Supabase API error:', e);
    }
    
    return updated;
  },

  resetToDefault(): { homework: HomeworkItem[]; bookings: BookingSlot[] } {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_HOMEWORK_KEY, JSON.stringify(INITIAL_HOMEWORK));
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
    }
    return { homework: INITIAL_HOMEWORK, bookings: INITIAL_BOOKINGS };
  },
};
