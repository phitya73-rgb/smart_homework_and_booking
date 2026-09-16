'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  School,
  Layers,
  BookOpen,
} from 'lucide-react';

const GRADES = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ม.3');
  const [selectedRoom, setSelectedRoom] = useState('13');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic rooms calculation:
  // ม.1, ม.2, ม.3 -> 1 to 15
  // ม.4, ม.5, ม.6 -> 1 to 11
  const maxRooms = ['ม.1', 'ม.2', 'ม.3'].includes(selectedGrade) ? 15 : 11;
  const roomOptions = Array.from({ length: maxRooms }, (_, i) => String(i + 1));

  // If selected room exceeds max rooms after grade switch, adjust it
  useEffect(() => {
    if (parseInt(selectedRoom) > maxRooms) {
      setSelectedRoom('1');
    }
  }, [selectedGrade, maxRooms, selectedRoom]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const isTeacher = ['ครู', 'คุณครู', 'teacher'].includes(username.trim().toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้งาน (Username) และรหัสผ่าน (Password) ให้ครบถ้วน');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('กรุณากรอกชื่อ-นามสกุลของคุณ');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username, password, {
      fullName: fullName.trim(),
      grade: isTeacher ? 'ทุกระดับชั้น' : selectedGrade,
      room: isTeacher ? 'ทุกห้อง' : selectedRoom,
    });
    setIsSubmitting(false);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setErrorMessage(result.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/50 to-indigo-50/40 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Decorative Pastel Background Blobs */}
      <div className="fixed top-12 left-12 w-72 h-72 bg-sky-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-12 right-12 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-lg">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25 text-white mb-3 transform hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            ระบบการบ้าน & การจองคิว
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center justify-center gap-1.5 font-medium">
            <span>ลงทะเบียนเข้าใช้งานประจำชั้นเรียน</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl shadow-sky-100/70 border border-sky-100">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">เข้าสู่ระบบ (Sign In)</h2>
              <p className="text-xs text-slate-500">กรอกข้อมูลส่วนตัวและเลือกระดับชั้นเรียน</p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-700">
              {isTeacher ? 'สิทธิ์คุณครู' : `ห้อง ${selectedGrade}/${selectedRoom}`}
            </span>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/70 rounded-2xl text-rose-600 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-rose-600 font-bold text-xs">!</span>
              </div>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input with Thai Role Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  ชื่อผู้ใช้งานในระบบ (Username)
                  <span className="text-rose-500">*</span>
                </label>
                {/* Role Chips */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setUsername('นักเรียน')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      username.trim() === 'นักเรียน' || username.trim().toLowerCase() === 'student'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    นักเรียน
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsername('หัวหน้าห้อง')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      username.trim() === 'หัวหน้าห้อง' || username.trim().toLowerCase() === 'leader'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    หัวหน้าห้อง
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsername('ครู')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      isTeacher
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ครู
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="นักเรียน / หัวหน้าห้อง / ครู"
                  className="w-full pl-3.5 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-sky-500" />
                <span>ชื่อ - นามสกุล</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี หรือ กิตติศักดิ์ พรหมมา"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                required
              />
            </div>

            {/* Grade & Room Selection - HIDE IF TEACHER */}
            {!isTeacher ? (
              <div className="space-y-2 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-sky-500" />
                      <span>ระดับชั้น</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition cursor-pointer"
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-sky-500" />
                      <span>ห้องเรียน</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition cursor-pointer"
                    >
                      {roomOptions.map((r) => (
                        <option key={r} value={r}>
                          ห้อง {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                  💡 {['ม.1', 'ม.2', 'ม.3'].includes(selectedGrade) ? `${selectedGrade} มีห้อง 1 ถึง 15` : `${selectedGrade} มีห้อง 1 ถึง 11`}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center gap-2.5 animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-900">เข้าสู่ระบบสิทธิ์คุณครู</div>
                  <div className="text-[11px] text-indigo-600 font-medium">
                    ไม่ต้องระบุระดับชั้นและห้องเรียน (สามารถดูแลได้ทุกระดับชั้น)
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รหัสผ่าน (Password)
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold text-sm shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transform active:scale-[0.98] transition duration-150 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <span>กำลังเข้าสู่ระบบ...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบ (Login)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
