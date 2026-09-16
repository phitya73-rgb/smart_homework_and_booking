'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, BookOpen, Calendar, AlignLeft, Check, Layers, School } from 'lucide-react';
import { HomeworkItem } from '@/types/homework';

interface AddHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (homework: Omit<HomeworkItem, 'id' | 'createdAt' | 'statusByUser'>) => void;
  username: string;
  defaultGrade?: string;
  defaultRoom?: string;
}

const COMMON_SUBJECTS = [
  'คณิตศาสตร์พื้นฐาน',
  'คณิตศาสตร์เพิ่มเติม',
  'ฟิสิกส์',
  'เคมี',
  'ชีววิทยา',
  'ภาษาไทย',
  'ภาษาอังกฤษ',
  'สังคมศึกษา',
  'ประวัติศาสตร์',
  'วิทยาการคำนวณ',
  'ศิลปะ/ดนตรี',
  'แนะแนว',
];

const GRADES = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];

export default function AddHomeworkModal({
  isOpen,
  onClose,
  onAdd,
  username,
  defaultGrade = 'ม.3',
  defaultRoom = '13',
}: AddHomeworkModalProps) {
  const [subject, setSubject] = useState(COMMON_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('16:30');
  const [grade, setGrade] = useState(defaultGrade);
  const [room, setRoom] = useState(defaultRoom);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxRooms = ['ม.1', 'ม.2', 'ม.3'].includes(grade) ? 15 : 11;
  const roomOptions = Array.from({ length: maxRooms }, (_, i) => String(i + 1));

  useEffect(() => {
    if (parseInt(room) > maxRooms) {
      setRoom('1');
    }
  }, [grade, maxRooms, room]);

  useEffect(() => {
    if (defaultGrade) setGrade(defaultGrade);
    if (defaultRoom) setRoom(defaultRoom);
  }, [defaultGrade, defaultRoom, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubject = isCustomSubject ? customSubject.trim() : subject;

    if (!finalSubject || !title.trim() || !deadlineDate) {
      alert('กรุณากรอกข้อมูลชื่อวิชา หัวข้องาน และกำหนดวันส่งให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    const deadline = `${deadlineDate} ${deadlineTime || '23:59'}`;

    onAdd({
      subject: finalSubject,
      title: title.trim(),
      description: description.trim(),
      deadline,
      createdBy: username,
      grade,
      room,
      targetClass: `${grade}/${room}`,
    });

    setIsSubmitting(false);
    onClose();
    // Reset form
    setTitle('');
    setDescription('');
    setDeadlineDate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-sky-100 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                <span>เพิ่มการบ้านใหม่</span>
                <span className="text-[11px] font-medium bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                  สิทธิ์หัวหน้าห้อง
                </span>
              </h3>
              <p className="text-xs text-slate-500">บันทึกงานใหม่ให้นักเรียนในห้อง {grade}/{room}</p>
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
          {/* Target Grade & Room (Locked to leader's class) */}
          <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">ระดับชั้นและห้องเรียนเป้าหมาย</div>
                <div className="text-sm font-bold text-sky-900">
                  ห้อง {defaultGrade}/{defaultRoom} (ห้องของคุณ)
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200/60">
              ห้องเรียนของคุณ
            </span>
          </div>

          {/* Subject */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                <span>ชื่อรายวิชา</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomSubject(!isCustomSubject)}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
              >
                {isCustomSubject ? 'เลือกจากวิชาหลัก' : '+ พิมพ์วิชาอื่นเอง'}
              </button>
            </div>

            {isCustomSubject ? (
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="พิมพ์ชื่อวิชา เช่น ดาราศาสตร์ หรือ ภาษาจีน"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            ) : (
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {COMMON_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              หัวข้องาน / การบ้าน (Title)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น แบบฝึกหัดบทที่ 3 ข้อ 1-15"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-sky-500" />
              <span>รายละเอียดงาน (Description)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="ระบุข้อกำหนด เช่น ทำลงสมุด หรือ ส่งเป็นไฟล์ PDF ในกลุ่ม"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
            />
          </div>

          {/* Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>กำหนดส่ง (วันที่)</span>
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เวลาส่ง (เช่น 16:30 หรือ 23:59)
              </label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>
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
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-medium shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกการบ้าน</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
