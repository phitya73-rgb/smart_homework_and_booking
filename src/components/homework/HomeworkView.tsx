'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';
import { HomeworkItem, HomeworkStatus } from '@/types/homework';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Filter,
  User as UserIcon,
  Edit2,
  Trash2,
  Layers,
  School,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import AddHomeworkModal from './AddHomeworkModal';
import EditHomeworkModal from './EditHomeworkModal';
import SubmissionListModal from './SubmissionListModal';

interface HomeworkViewProps {
  user: User;
  homeworkList: HomeworkItem[];
  onAddHomework: (item: Omit<HomeworkItem, 'id' | 'createdAt' | 'statusByUser'>) => void;
  onEditHomework: (updatedItem: HomeworkItem) => void;
  onDeleteHomework: (id: string) => void;
  onToggleStatus: (id: string, newStatus: HomeworkStatus) => void;
}

const GRADES = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];

export default function HomeworkView({
  user,
  homeworkList,
  onAddHomework,
  onEditHomework,
  onDeleteHomework,
  onToggleStatus,
}: HomeworkViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<HomeworkItem | null>(null);
  const [viewingSubmissions, setViewingSubmissions] = useState<HomeworkItem | null>(null);

  // Teacher specific filters
  const [teacherGradeFilter, setTeacherGradeFilter] = useState<string>('all');
  const [teacherRoomFilter, setTeacherRoomFilter] = useState<string>('all');

  const isLeader = user.role === 'leader';
  const isTeacher = user.role === 'teacher';

  // Compute room options for teacher filter
  const teacherMaxRooms = ['ม.1', 'ม.2', 'ม.3'].includes(teacherGradeFilter) ? 15 : 11;
  const teacherRoomOptions = teacherGradeFilter === 'all'
    ? Array.from({ length: 15 }, (_, i) => String(i + 1))
    : Array.from({ length: teacherMaxRooms }, (_, i) => String(i + 1));

  // Check if homework matches current user's class (for student & leader)
  const isClassMatch = (item: HomeworkItem) => {
    if (isTeacher) return true;
    if (user.classLabel && item.targetClass && user.classLabel === item.targetClass) {
      return true;
    }
    if (
      user.grade &&
      user.room &&
      item.grade &&
      item.room &&
      user.grade === item.grade &&
      user.room === item.room
    ) {
      return true;
    }
    return false;
  };

  // Calculate stats for current scope
  const myClassHomeworkList = homeworkList.filter(isClassMatch);
  const totalHomework = isTeacher ? homeworkList.length : myClassHomeworkList.length;
  const mySubmittedCount = myClassHomeworkList.filter(
    (h) => (h.statusByUser?.[user.username] || 'pending') === 'submitted'
  ).length;
  const myPendingCount = totalHomework - mySubmittedCount;

  const filteredList = homeworkList.filter((item) => {
    // 1. Isolate to current student/leader's class
    if (!isClassMatch(item)) return false;

    // 2. Search query
    const matchesSearch =
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 3. Teacher class & room filters
    if (isTeacher) {
      if (teacherGradeFilter !== 'all' && item.grade && item.grade !== teacherGradeFilter) {
        return false;
      }
      if (teacherRoomFilter !== 'all' && item.room && item.room !== teacherRoomFilter) {
        return false;
      }
    }

    // 4. Student & leader personal status filter
    if (!isTeacher && filterStatus !== 'all') {
      const currentStatus = item.statusByUser?.[user.username] || 'pending';
      if (currentStatus !== filterStatus) return false;
    }

    return true;
  });

  const handleDeleteClick = (id: string, title: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบการบ้าน "${title}" ?`)) {
      onDeleteHomework(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-sky-500/15 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {user.classLabel ? `ห้องเรียน ${user.classLabel}` : 'ระบบการบ้าน'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">รายการการบ้าน</h2>
            <p className="text-sky-100 text-xs sm:text-sm mt-1">
              {isTeacher
                ? 'คุณครูสามารถกรองดูข้อมูลการบ้านและตรวจเช็คสถานะการส่งงานของนักเรียนแต่ละห้องได้'
                : isLeader
                ? 'หัวหน้าห้องมีสิทธิ์ เพิ่ม, แก้ไข และ ลบการบ้าน รวมถึงสลับสถานะส่งงานของตนเอง'
                : 'ตรวจสอบกำหนดส่งงาน และกดสลับสถานะเมื่อส่งการบ้านเรียบร้อยแล้ว'}
            </p>
          </div>

          {/* Leader Only: Add Homework Button */}
          {isLeader && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-sky-50 font-bold text-sm shadow-md transition transform active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>เพิ่มการบ้านใหม่</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                หัวหน้า
              </span>
            </button>
          )}
        </div>

        {/* Stats bar */}
        <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center sm:text-left">
            <div className="text-xs text-sky-100">การบ้านทั้งหมด</div>
            <div className="text-xl sm:text-2xl font-bold">{totalHomework} รายการ</div>
          </div>
          {!isTeacher && (
            <>
              <div className="bg-emerald-400/20 backdrop-blur-sm rounded-2xl p-3 text-center sm:text-left">
                <div className="text-xs text-emerald-100">ส่งแล้วของฉัน</div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-200">
                  {mySubmittedCount} งาน
                </div>
              </div>
              <div className="bg-amber-400/20 backdrop-blur-sm rounded-2xl p-3 text-center sm:text-left col-span-2 sm:col-span-1">
                <div className="text-xs text-amber-100">ยังไม่ส่ง</div>
                <div className="text-xl sm:text-2xl font-bold text-amber-200">
                  {myPendingCount} งาน
                </div>
              </div>
            </>
          )}
          {isTeacher && (
            <>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center sm:text-left">
                <div className="text-xs text-sky-100">ห้องเรียนที่แสดงผล</div>
                <div className="text-lg sm:text-xl font-bold text-sky-100">
                  {teacherGradeFilter === 'all' && teacherRoomFilter === 'all'
                    ? 'ทุกระดับชั้น / ทุกห้อง'
                    : `${teacherGradeFilter !== 'all' ? teacherGradeFilter : ''}${
                        teacherRoomFilter !== 'all' ? `/${teacherRoomFilter}` : ''
                      }`}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center sm:text-left col-span-2 sm:col-span-1">
                <div className="text-xs text-sky-100">งานตรงตามตัวกรอง</div>
                <div className="text-xl sm:text-2xl font-bold text-sky-200">
                  {filteredList.length} งาน
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Teacher Specialized Class & Room Filter Bar */}
      {isTeacher && (
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-sky-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>ตัวกรองการบ้านสำหรับคุณครู (Filter by Grade & Room)</span>
            </div>
            <span className="text-xs text-slate-400">เลือกดูงานแยกตามชั้นและห้อง</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Grade Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>ระดับชั้น</span>
              </label>
              <select
                value={teacherGradeFilter}
                onChange={(e) => {
                  setTeacherGradeFilter(e.target.value);
                  setTeacherRoomFilter('all');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="all">ทุกระดับชั้น (ม.1 - ม.6)</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-indigo-500" />
                <span>ห้องเรียน</span>
              </label>
              <select
                value={teacherRoomFilter}
                onChange={(e) => setTeacherRoomFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="all">ทุกห้องเรียน</option>
                {teacherRoomOptions.map((r) => (
                  <option key={r} value={r}>
                    ห้อง {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filter Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setTeacherGradeFilter('all');
                  setTeacherRoomFilter('all');
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
              >
                ล้างตัวกรอง (ดูทั้งหมด)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-sky-100/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อวิชา, หัวข้องาน..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Student & Leader filter tabs */}
        {!isTeacher && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline flex items-center gap-1">
              <Filter className="w-3 h-3" /> กรอง:
            </span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                filterStatus === 'all'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({totalHomework})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                filterStatus === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              ยังไม่ส่ง ({myPendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                filterStatus === 'submitted'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ส่งแล้ว ({mySubmittedCount})
            </button>
          </div>
        )}
      </div>

      {/* Homework Cards List */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-sky-100 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-sky-50 text-sky-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-700">
            {searchTerm ? 'ไม่พบการบ้านที่ค้นหา' : 'ยังไม่มีรายการการบ้านในห้องนี้'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchTerm
              ? 'ลองค้นหาด้วยคำอื่น'
              : isTeacher
              ? 'ยังไม่มีหัวหน้าห้องสร้างรายการการบ้าน หรือลองปรับตัวกรองดูห้องอื่น'
              : isLeader
              ? 'คุณสามารถคลิกปุ่ม "เพิ่มการบ้านใหม่" เพื่อสร้างรายการการบ้านแรกของห้องได้เลย'
              : 'เยี่ยมมาก! ยังไม่มีการบ้านค้างในห้องเรียนของคุณ'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredList.map((item) => {
            const currentStatus = item.statusByUser?.[user.username] || 'pending';
            const isSubmitted = currentStatus === 'submitted';

            // Only leader of this homework's specific class can edit/delete
            const isItemClassMatch =
              (user.classLabel && item.targetClass && user.classLabel === item.targetClass) ||
              (user.grade && user.room && item.grade && item.room && user.grade === item.grade && user.room === item.room);
            const canManage = isLeader && isItemClassMatch;

            // Calculate submitted count
            const submissions = item.submissions || [];
            const submittedCount = submissions.length > 0
              ? submissions.length
              : Object.values(item.statusByUser || {}).filter((s) => s === 'submitted').length;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                  isSubmitted && !isTeacher
                    ? 'border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/20'
                    : 'border-sky-100 hover:border-sky-200'
                }`}
              >
                <div>
                  {/* Card Header: Subject, Class Tag, Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200/60">
                        {item.subject}
                      </span>
                      {item.targetClass && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <School className="w-3 h-3 text-indigo-500" />
                          <span>{item.targetClass}</span>
                        </span>
                      )}
                    </div>

                    {/* Leader of this class only: Edit and Delete Buttons */}
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingHomework(item)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                          title="แก้ไขการบ้านนี้ (สิทธิ์หัวหน้าห้อง)"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(item.id, item.title)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="ลบการบ้านนี้ (สิทธิ์หัวหน้าห้อง)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1.5">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 mb-4 whitespace-pre-line leading-relaxed">
                    {item.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                  </p>

                  {/* Submission Tracking Bar */}
                  <div className="my-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setViewingSubmissions(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 border border-sky-200/80 transition cursor-pointer shadow-2xs active:scale-95"
                      title="คลิกเพื่อดูรายชื่อนักเรียนที่ส่งงานแล้ว"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                      <span>รายชื่อผู้ส่งงาน ({submittedCount} คน)</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-medium">
                      คลิกเพื่อดูว่าใครส่งแล้วบ้าง
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-sky-500" />
                      <span>ส่ง: {item.deadline}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      <span>ผู้สั่ง: {item.authorName || item.createdBy}</span>
                    </div>
                  </div>

                  {/* Toggle Button for Student & Leader */}
                  {!isTeacher ? (
                    <button
                      type="button"
                      onClick={() =>
                        onToggleStatus(item.id, isSubmitted ? 'pending' : 'submitted')
                      }
                      className={`w-full sm:w-auto px-4 py-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer transform active:scale-95 ${
                        isSubmitted
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                      }`}
                    >
                      {isSubmitted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>สถานะ: ส่งแล้ว (คลิกเพื่อเปลี่ยน)</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                          <span>สถานะ: ยังไม่ส่ง (คลิกเพื่อส่ง)</span>
                        </>
                      )}
                    </button>
                  ) : (
                    /* Teacher View: Clickable submission stats */
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingSubmissions(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer"
                        title="คลิกเพื่อดูรายชื่อนักเรียนที่ส่งงานแล้ว"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>นักเรียนส่งแล้ว {submittedCount} คน</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Homework Modal */}
      <AddHomeworkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddHomework}
        username={user.username}
        defaultGrade={user.grade || 'ม.3'}
        defaultRoom={user.room || '13'}
      />

      {/* Edit Homework Modal */}
      <EditHomeworkModal
        isOpen={!!editingHomework}
        onClose={() => setEditingHomework(null)}
        onSave={onEditHomework}
        homework={editingHomework}
      />

      {/* Submission List Modal */}
      <SubmissionListModal
        isOpen={!!viewingSubmissions}
        onClose={() => setViewingSubmissions(null)}
        homework={viewingSubmissions}
      />
    </div>
  );
}
