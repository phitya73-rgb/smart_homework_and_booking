'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, Users, FileText, MapPin, Check, User as UserIcon, Layers } from 'lucide-react';
import { BookingSlot } from '@/types/booking';

interface TeacherSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSlot: (slot: Omit<BookingSlot, 'id' | 'createdAt' | 'bookedStudents'>) => void;
  username: string;
  defaultTeacherName?: string;
}

export default function TeacherSlotModal({
  isOpen,
  onClose,
  onAddSlot,
  username,
  defaultTeacherName = '',
}: TeacherSlotModalProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('14:00');
  const [capacity, setCapacity] = useState(3);
  const [title, setTitle] = useState('');
  const [teacherName, setTeacherName] = useState(defaultTeacherName);
  const [targetGrade, setTargetGrade] = useState('ทุกระดับชั้น');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultTeacherName) {
      setTeacherName(defaultTeacherName);
    }
  }, [defaultTeacherName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTime || !endTime || !title.trim() || !teacherName.trim() || capacity < 1) {
      alert('กรุณากรอกข้อมูล วันที่ เวลา หัวข้อ ชื่อคุณครู และจำนวนโควตารับจองให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    onAddSlot({
      date,
      startTime,
      endTime,
      capacity: Number(capacity),
      title: title.trim(),
      teacherName: teacherName.trim(),
      targetGrade: targetGrade || 'ทุกระดับชั้น',
      notes: notes.trim(),
      createdBy: username,
    });

    setIsSubmitting(false);
    onClose();

    // Reset
    setDate('');
    setTitle('');
    setNotes('');
    setCapacity(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-sky-100 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                <span>เปิดรอบเวลาให้คำปรึกษา</span>
                <span className="text-[11px] font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  สิทธิ์ครู
                </span>
              </h3>
              <p className="text-xs text-slate-500">กำหนดวัน เวลา และจำนวนนักเรียนที่รับได้สูงสุด</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>หัวข้อการนัดหมาย / ให้คำปรึกษา</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ตรวจโครงงานวิทย์ / ซ่อมเสริมบทเรียน / ให้คำปรึกษาพอร์ต"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Teacher Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>ชื่อคุณครูผู้เปิดจอง (Teacher Name)</span>
            </label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="เช่น คุณครูสมศรี ใจดี หรือ ครูประจำวิชาฟิสิกส์"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Target Grade */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>ระดับชั้นที่เปิดรับจอง (Target Grade)</span>
            </label>
            <select
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="ทุกระดับชั้น">ทุกระดับชั้น (ม.1 - ม.6)</option>
              <option value="ม.1">ม.1</option>
              <option value="ม.2">ม.2</option>
              <option value="ม.3">ม.3</option>
              <option value="ม.4">ม.4</option>
              <option value="ม.5">ม.5</option>
              <option value="ม.6">ม.6</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>วันที่เปิดรับจอง</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>เวลาเริ่ม</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>เวลาสิ้นสุด</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
          </div>

          {/* Capacity (Highlight requirement) */}
          <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl">
            <label className="block text-xs font-bold text-sky-900 mb-1.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              <span>จำนวนคนที่รับจองได้สูงสุดในรอบนี้ (Capacity)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="50"
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-28 px-3.5 py-2.5 rounded-xl bg-white border border-sky-300 text-sm font-semibold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
              <span className="text-xs text-sky-700">
                คน (เมื่อจองครบ {capacity} คน ระบบจะล็อกปุ่มไม่ให้จองเพิ่มทันที)
              </span>
            </div>
          </div>

          {/* Notes / Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>สถานที่นัดพบ / รายละเอียดเพิ่มเติม (Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ห้องพักครูหมวดวิทย์ อาคาร 3 ชั้น 2"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-medium shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>สร้างรอบเวลานี้</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
