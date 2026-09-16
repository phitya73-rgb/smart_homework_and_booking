'use client';

import React from 'react';
import { X, CheckCircle2, UserCheck, Clock, School, User as UserIcon } from 'lucide-react';
import { HomeworkItem } from '@/types/homework';

interface SubmissionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: HomeworkItem | null;
}

export default function SubmissionListModal({
  isOpen,
  onClose,
  homework,
}: SubmissionListModalProps) {
  if (!isOpen || !homework) return null;

  const submissions = homework.submissions || [];
  const count = submissions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-sky-100 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  {homework.subject}
                </span>
                {homework.targetClass && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 flex items-center gap-1">
                    <School className="w-3 h-3" />
                    <span>{homework.targetClass}</span>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-1 line-clamp-1">
                {homework.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle / Counter */}
        <div className="py-3 px-4 my-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>สถานะการส่งงานของนักเรียนในห้อง</span>
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white text-emerald-700 border border-emerald-200 shadow-xs">
            ส่งแล้ว {count} คน
          </span>
        </div>

        {/* List of Submissions */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
          {count === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                <UserIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium">ยังไม่มีนักเรียนส่งการบ้านชิ้นนี้</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                เมื่อนักเรียนกดปุ่ม &quot;ส่งแล้ว&quot; รายชื่อจะปรากฏขึ้นทันที
              </p>
            </div>
          ) : (
            submissions.map((sub, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      {sub.name}
                    </div>
                    {sub.classLabel && (
                      <div className="text-[11px] text-slate-400 font-medium">
                        ห้อง {sub.classLabel}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>ส่งแล้ว</span>
                  </span>
                  {sub.submittedAt && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{sub.submittedAt}</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Close Button */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
