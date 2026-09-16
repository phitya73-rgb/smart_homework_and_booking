'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, User } from '@/types/auth';
import { MOCK_ACCOUNTS, USER_ALIASES } from '@/lib/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'homework_booking_session_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username && MOCK_ACCOUNTS[parsed.username]) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load user from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    username: string,
    password: string,
    extra?: { fullName?: string; grade?: string; room?: string }
  ) => {
    const trimmedUsername = username.trim().toLowerCase();
    const resolvedRole = USER_ALIASES[trimmedUsername];
    const account = resolvedRole ? MOCK_ACCOUNTS[resolvedRole] : undefined;

    if (!account) {
      return {
        success: false,
        message: "ไม่พบชื่อผู้ใช้งานนี้ในระบบ กรุณากรอก 'นักเรียน', 'หัวหน้าห้อง' หรือ 'ครู'",
      };
    }

    if (account.password !== password.trim()) {
      return {
        success: false,
        message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง',
      };
    }

    // Compose user object
    const isTeacher = account.user.role === 'teacher';
    const finalName = extra?.fullName?.trim() || account.user.name;
    const finalGrade = isTeacher ? 'ทุกระดับชั้น' : (extra?.grade || 'ม.3');
    const finalRoom = isTeacher ? 'ทุกห้อง' : (extra?.room || '13');
    const classLabel = isTeacher ? 'อาจารย์ที่ปรึกษา' : `${finalGrade}/${finalRoom}`;

    const updatedUser: User = {
      ...account.user,
      name: finalName,
      grade: finalGrade,
      room: finalRoom,
      classLabel: classLabel,
    };

    setUser(updatedUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      
      // Async sync user to Google Sheets
      fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveUser',
          user: updatedUser,
        }),
      }).catch((e) => console.warn('Sync user notice:', e));
    } catch (e) {
      console.error('Failed to persist user session', e);
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear user session', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
