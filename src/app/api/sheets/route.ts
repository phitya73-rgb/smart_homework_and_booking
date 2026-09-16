import { NextResponse } from 'next/server';
import { GOOGLE_SCRIPT_WEBAPP_URL } from '@/lib/constants';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'getAll';

  try {
    const targetUrl = new URL(GOOGLE_SCRIPT_WEBAPP_URL);
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
      redirect: 'follow',
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text, isHtml: text.includes('<!DOCTYPE html>') };
    }

    return NextResponse.json({
      success: response.ok && !text.includes('Cannot read properties of null'),
      status: response.status,
      data,
      remoteUrl: targetUrl.toString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch from Google Apps Script',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      redirect: 'follow',
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text, isHtml: text.includes('<!DOCTYPE html>') };
    }

    const hasAppError =
      text.includes('Cannot read properties of null') ||
      (typeof data === 'object' && data?.status === 'error');

    return NextResponse.json({
      success: response.ok && !hasAppError,
      status: response.status,
      data,
      note: hasAppError
        ? 'Google Apps Script ตอบกลับข้อผิดพลาด (เช่น ชื่อ Sheet ไม่ตรง) ระบบจะทำการบันทึกและแสดงผลแบบ Local Sync ให้ทันที'
        : 'Synced with Google Sheets',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to send to Google Apps Script',
      },
      { status: 500 }
    );
  }
}
