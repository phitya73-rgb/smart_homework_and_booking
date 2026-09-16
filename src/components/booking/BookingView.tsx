'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';
import { BookingSlot } from '@/types/booking';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Lock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Trash2,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit2,
  User as UserIcon,
  Layers,
} from 'lucide-react';
import TeacherSlotModal from './TeacherSlotModal';
import EditSlotModal from './EditSlotModal';

interface BookingViewProps {
  user: User;
  bookingSlots: BookingSlot[];
  onAddSlot: (slot: Omit<BookingSlot, 'id' | 'createdAt' | 'bookedStudents'>) => void;
  onEditSlot?: (slot: BookingSlot) => void;
  onBookSlot: (slotId: string) => void;
  onCancelBooking: (slotId: string) => void;
  onDeleteSlot: (slotId: string) => void;
}

export default function BookingView({
  user,
  bookingSlots,
  onAddSlot,
  onEditSlot,
  onBookSlot,
  onCancelBooking,
  onDeleteSlot,
}: BookingViewProps) {
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<BookingSlot | null>(null);
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);

  const isTeacher = user.role === 'teacher';

  const toggleExpand = (id: string) => {
    setExpandedSlotId(expandedSlotId === id ? null : id);
  };

  const handleSlotBookingClick = (slot: BookingSlot) => {
    if (
      slot.targetGrade &&
      slot.targetGrade !== 'ทุกระดับชั้น' &&
      user.grade &&
      user.grade !== slot.targetGrade &&
      user.role !== 'teacher'
    ) {
      alert(
        `รอบเวลานี้เปิดรับเฉพาะนักเรียนระดับชั้น ${slot.targetGrade} เท่านั้น (ระดับชั้นที่คุณเลือกคือ ${user.grade})`
      );
      return;
    }
    onBookSlot(slot.id);
  };

  // Sort slots by date ascending
  const sortedSlots = [...bookingSlots].sort((a, b) => {
    const dA = new Date(`${a.date}T${a.startTime}`);
    const dB = new Date(`${b.date}T${b.startTime}`);
    return dA.getTime() - dB.getTime();
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-blue-600 to-sky-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/15 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>ระบบการจองคิวพบครู (Teacher Office Hours Booking)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              ตารางเวลาว่าง & นัดหมาย
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1">
              {isTeacher
                ? 'เปิดรอบเวลาให้นักเรียนจองเข้ามาปรึกษา หรือกำหนดโควตาจำนวนคนในแต่ละช่วงเวลา'
                : 'เลือกวัน-เวลาที่คุณครูเปิดรับ และกดจองคิวก่อนที่โควตาจะเต็ม'}
            </p>
          </div>

          {/* Teacher Only: Add Slot Button */}
          {isTeacher && (
            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-sky-50 font-semibold text-sm shadow-md transition transform active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>เปิดรอบเวลาใหม่</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                ครู
              </span>
            </button>
          )}
        </div>

        {/* Quick summary stats pills */}
        <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center sm:text-left">
            <div className="text-xs text-indigo-100">รอบเวลาทั้งหมด</div>
            <div className="text-xl sm:text-2xl font-bold">{bookingSlots.length} รอบ</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center sm:text-left">
            <div className="text-xs text-indigo-100">นักเรียนที่จองแล้ว</div>
            <div className="text-xl sm:text-2xl font-bold">
              {bookingSlots.reduce((acc, s) => acc + s.bookedStudents.length, 0)} คน
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center sm:text-left col-span-2 sm:col-span-1">
            <div className="text-xs text-indigo-100">ระบบจำกัดโควตา</div>
            <div className="text-base font-bold text-sky-200">ล็อกอัตโนมัติเมื่อเต็ม</div>
          </div>
        </div>
      </div>

      {/* Slots List */}
      {sortedSlots.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-sky-100 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 text-indigo-400 flex items-center justify-center mb-3">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-700">ยังไม่มีรอบเวลาที่เปิดจอง</h3>
          <p className="text-xs text-slate-400 mt-1">
            {isTeacher
              ? 'กดปุ่ม "เปิดรอบเวลาใหม่" ด้านบนเพื่อเริ่มกำหนดวันเวลาที่ว่าง'
              : 'กรุณารอคุณครูกำหนดรอบเวลาว่าง แล้วกลับมาตรวจสอบอีกครั้ง'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {sortedSlots.map((slot) => {
            const bookedCount = slot.bookedStudents.length;
            const isFull = bookedCount >= slot.capacity;
            const remaining = Math.max(0, slot.capacity - bookedCount);
            const isMyBooking = slot.bookedStudents.some((b) => b.username === user.username);
            const isExpanded = expandedSlotId === slot.id;

            return (
              <div
                key={slot.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                  isMyBooking
                    ? 'border-sky-300 bg-gradient-to-br from-white to-sky-50/30'
                    : isFull
                    ? 'border-slate-200 bg-slate-50/50'
                    : 'border-sky-100 hover:border-sky-200'
                }`}
              >
                <div>
                  {/* Top Bar: Date, Target Grade & Capacity Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{slot.date}</span>
                      </div>

                      {/* Target Grade Badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/70">
                        <Layers className="w-3 h-3 text-sky-600" />
                        <span>เปิดรับ: {slot.targetGrade || 'ทุกระดับชั้น'}</span>
                      </span>
                    </div>

                    {/* Capacity Indicator Badge */}
                    <div className="flex items-center gap-1.5">
                      {isFull ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          <Lock className="w-3 h-3 text-rose-500" />
                          <span>เต็มแล้ว ({slot.capacity}/{slot.capacity})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Users className="w-3 h-3 text-emerald-600" />
                          <span>
                            ว่าง {remaining} ที่ ({bookedCount}/{slot.capacity})
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Teacher Name */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                    {slot.title}
                  </h3>

                  {/* Teacher Name Tag */}
                  <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold mb-2.5 bg-indigo-50/80 px-2.5 py-1 rounded-xl border border-indigo-100/70 w-fit">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>คุณครูผู้เปิดจอง: {slot.teacherName || slot.createdBy}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-sky-700 mb-3">
                    <Clock className="w-4 h-4 text-sky-500" />
                    <span>
                      {slot.startTime} น. - {slot.endTime} น.
                    </span>
                  </div>

                  {/* Location / Notes */}
                  {slot.notes && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>{slot.notes}</span>
                    </div>
                  )}

                  {/* Capacity Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>จำนวนผู้จอง</span>
                      <span className="font-semibold">
                        {bookedCount} / {slot.capacity} คน
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull
                            ? 'bg-rose-500'
                            : bookedCount > 0
                            ? 'bg-gradient-to-r from-sky-400 to-indigo-500'
                            : 'bg-slate-200'
                        }`}
                        style={{ width: `${Math.min(100, (bookedCount / slot.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action & Details */}
                <div className="pt-4 border-t border-slate-100">
                  {/* For Teacher: View Attendees & Edit & Delete */}
                  {isTeacher ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleExpand(slot.id)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>ดูรายชื่อผู้จอง ({bookedCount} คน)</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingSlot(slot)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                            title="แก้ไขรอบเวลานี้ (สิทธิ์ครู)"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรอบเวลา "${slot.title}" ?`)) {
                                onDeleteSlot(slot.id);
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="ลบรอบเวลานี้ (สิทธิ์ครู)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable attendee list */}
                      {isExpanded && (
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 animate-in fade-in duration-150">
                          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            รายชื่อนักเรียนในรอบนี้:
                          </div>
                          {slot.bookedStudents.length === 0 ? (
                            <div className="text-xs text-slate-400 italic">
                              ยังไม่มีนักเรียนจองรอบนี้
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {slot.bookedStudents.map((student, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-100"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">
                                      {idx + 1}
                                    </div>
                                    <span className="font-medium text-slate-800">
                                      {student.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    {student.bookedAt}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* For Student & Leader: Book or Cancel */
                    <div>
                      {isMyBooking ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <div className="w-full sm:flex-1 py-2 px-3 rounded-2xl bg-sky-100 text-sky-800 text-xs font-semibold flex items-center justify-center gap-1.5 border border-sky-200">
                            <CheckCircle2 className="w-4 h-4 text-sky-600" />
                            <span>คุณจองรอบนี้แล้ว</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onCancelBooking(slot.id)}
                            className="w-full sm:w-auto px-3.5 py-2 rounded-2xl text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : isFull ? (
                        /* When Full: Lock Button */
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-75"
                        >
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>รอบนี้เต็มแล้ว (ไม่สามารถจองเพิ่มได้)</span>
                        </button>
                      ) : (
                        /* Available: Book button */
                        <button
                          type="button"
                          onClick={() => handleSlotBookingClick(slot)}
                          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-semibold shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 transition transform active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>จองคิวรอบนี้ (เหลือ {remaining} ที่นั่ง)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teacher Slot Modal (Add) */}
      <TeacherSlotModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        onAddSlot={onAddSlot}
        username={user.username}
        defaultTeacherName={user.name}
      />

      {/* Edit Slot Modal */}
      <EditSlotModal
        isOpen={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        onSaveSlot={(slot) => {
          onEditSlot?.(slot);
          setEditingSlot(null);
        }}
        slot={editingSlot}
      />
    </div>
  );
}
