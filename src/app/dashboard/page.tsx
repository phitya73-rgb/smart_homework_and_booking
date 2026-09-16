'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/dataService';
import { HomeworkItem, HomeworkStatus } from '@/types/homework';
import { BookingSlot } from '@/types/booking';
import HomeworkView from '@/components/homework/HomeworkView';
import BookingView from '@/components/booking/BookingView';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  LogOut,
  Sparkles,
  RotateCcw,
  School,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading, login } = useAuth();

  const [activeTab, setActiveTab] = useState<'homework' | 'booking'>('homework');
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated) {
      setHomeworkList(dataService.getHomeworkList());
      setBookingSlots(dataService.getBookingSlots());
    }
  }, [isAuthenticated, isLoading, router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- HOMEWORK HANDLERS ---
  const handleAddHomework = async (
    item: Omit<HomeworkItem, 'id' | 'createdAt' | 'statusByUser'>
  ) => {
    if (!user) return;
    await dataService.addHomework(item, user.username, user.name);
    setHomeworkList(dataService.getHomeworkList());
    showToast(`เพิ่มการบ้านวิชา "${item.subject}" เรียบร้อยแล้ว! ✨`);
  };

  const handleEditHomework = async (updatedItem: HomeworkItem) => {
    const updated = await dataService.editHomework(updatedItem);
    setHomeworkList([...updated]);
    showToast(`บันทึกการแก้ไขการบ้านวิชา "${updatedItem.subject}" สำเร็จ! ✨`);
  };

  const handleDeleteHomework = async (id: string) => {
    const updated = await dataService.deleteHomework(id);
    setHomeworkList([...updated]);
    showToast('ลบการบ้านออกจากระบบเรียบร้อยแล้ว 🗑️');
  };

  const handleToggleHomeworkStatus = async (id: string, newStatus: HomeworkStatus) => {
    if (!user) return;
    const updated = await dataService.updateHomeworkStatus(id, user.username, newStatus, user);
    setHomeworkList([...updated]);
    showToast(
      newStatus === 'submitted'
        ? 'เปลี่ยนสถานะเป็น "ส่งแล้ว" เรียบร้อยแล้ว 🎉'
        : 'เปลี่ยนสถานะเป็น "ยังไม่ส่ง" ⏳'
    );
  };

  // --- BOOKING HANDLERS ---
  const handleAddSlot = async (
    slotData: Omit<BookingSlot, 'id' | 'createdAt' | 'bookedStudents'>
  ) => {
    if (!user) return;
    await dataService.addBookingSlot(slotData, user.username);
    setBookingSlots(dataService.getBookingSlots());
    showToast('สร้างรอบเวลาให้คำปรึกษาใหม่เรียบร้อยแล้ว! 📅');
  };

  const handleBookSlot = async (slotId: string) => {
    if (!user) return;
    const res = await dataService.bookSlot(slotId, user);
    if (res.success) {
      setBookingSlots(res.slots);
      showToast('จองคิวสำเร็จเรียบร้อยแล้ว! 🎉');
    } else {
      alert(res.message || 'ไม่สามารถจองคิวได้');
    }
  };

  const handleCancelBooking = async (slotId: string) => {
    if (!user) return;
    const res = await dataService.cancelBooking(slotId, user.username);
    if (res.success) {
      setBookingSlots(res.slots);
      showToast('ยกเลิกการจองเรียบร้อยแล้ว');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    const updated = await dataService.deleteSlot(slotId);
    setBookingSlots([...updated]);
    showToast('ลบรอบเวลานี้แล้ว');
  };

  const handleEditSlot = async (updatedSlot: BookingSlot) => {
    const updated = await dataService.editBookingSlot(updatedSlot);
    setBookingSlots([...updated]);
    showToast(`แก้ไขรอบเวลา "${updatedSlot.title}" สำเร็จ! ✨`);
  };

  const handleResetData = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลระบบกลับเป็นค่าเริ่มต้น (ว่างเปล่า) หรือไม่?')) {
      const reset = dataService.resetToDefault();
      setHomeworkList(reset.homework);
      setBookingSlots(reset.bookings);
      showToast('รีเซ็ตข้อมูลระบบเรียบร้อยแล้ว');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800/90 text-white px-5 py-3 rounded-2xl shadow-xl backdrop-blur-sm border border-slate-700/60 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-xs">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-none">
                ระบบการบ้าน & การจอง
              </h1>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline flex items-center gap-1 mt-0.5">
                <School className="w-3 h-3 text-sky-500" />
                <span>{user.classLabel ? `ห้องเรียน ${user.classLabel}` : 'ระบบโรงเรียน'}</span>
              </span>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Current User Badge */}
            <div className="flex items-center gap-2.5 bg-sky-50/70 border border-sky-100 py-1.5 px-3 rounded-2xl">
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${
                  user.avatarBg || 'from-sky-500 to-blue-600'
                } text-white flex items-center justify-center text-xs font-bold shadow-xs`}
              >
                {user.role === 'teacher' ? 'ครู' : user.role === 'leader' ? 'หน.' : 'นร.'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-none">{user.name}</div>
                <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
                  {user.roleTitle} {user.classLabel ? `(${user.classLabel})` : ''}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200/80 mb-6">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('homework')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-5 font-semibold text-xs sm:text-sm border-b-2 transition cursor-pointer ${
                activeTab === 'homework'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>ระบบการบ้าน (Homework)</span>
              <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                {homeworkList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-5 font-semibold text-xs sm:text-sm border-b-2 transition cursor-pointer ${
                activeTab === 'booking'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>ระบบการจองคิว (Booking)</span>
              <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {bookingSlots.length}
              </span>
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetData}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 hidden sm:flex cursor-pointer"
            title="รีเซ็ตข้อมูลตัวอย่าง"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตข้อมูลตัวอย่าง</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'homework' && (
          <HomeworkView
            user={user}
            homeworkList={homeworkList}
            onAddHomework={handleAddHomework}
            onEditHomework={handleEditHomework}
            onDeleteHomework={handleDeleteHomework}
            onToggleStatus={handleToggleHomeworkStatus}
          />
        )}

        {activeTab === 'booking' && (
          <BookingView
            user={user}
            bookingSlots={bookingSlots}
            onAddSlot={handleAddSlot}
            onEditSlot={handleEditSlot}
            onBookSlot={handleBookSlot}
            onCancelBooking={handleCancelBooking}
            onDeleteSlot={handleDeleteSlot}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-xs text-slate-400 border-t border-slate-200/60">
        <p>ระบบการบ้านและการจองคิว • พัฒนาด้วย Next.js (App Router) และ Tailwind CSS</p>
      </footer>
    </div>
  );
}
