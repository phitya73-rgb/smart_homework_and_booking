/**
 * Google Apps Script สำหรับระบบการบ้านและการจองคิว (Homework & Booking System)
 * เวอร์ชันอัปเดตล่าสุด: รองรับการเลือก ระดับชั้น (ม.1 - ม.6), ห้องเรียน, การแก้ไข/ลบการบ้าน และบันทึกข้อมูลผู้ใช้
 * -------------------------------------------------------------------------------------------------
 * วิธีการนำไปใช้งานใน Google Sheets:
 * 1. เปิด Google Sheets เปล่า (หรือไฟล์เดิม)
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) -> "Apps Script"
 * 3. ลบโค้ดเดิมทั้งหมดในไฟล์ Code.gs ออก แล้ววางโค้ดชุดนี้ลงไปแทน
 * 4. กดไอคอน "บันทึก" (Save)
 * 5. กดปุ่ม "การปรับใช้" (Deploy) -> "การปรับใช้ใหม่" (New deployment)
 * 6. เลือกประเภท: "เว็บแอปพลิเคชัน" (Web app)
 *    - คำอธิบาย: เวอร์ชันล่าสุด (เช่น v2)
 *    - ดำเนินการในฐานะ: ฉัน (Me)
 *    - ผู้มีสิทธิ์เข้าถึง: ทุกคน (Anyone)  *** สำคัญมาก ต้องเลือก Anyone ***
 * 7. กด "ปรับใช้" (Deploy) แล้วคัดลอก URL เว็บแอปมาใช้งาน
 */

const SHEET_HOMEWORK = 'Homework';
const SHEET_BOOKINGS = 'Bookings';
const SHEET_USERS = 'Users';

function getOrCreateSheet(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#e0f2fe')
        .setFontColor('#0369a1');
    }
  }
  return sheet;
}

function initSheets() {
  getOrCreateSheet(SHEET_HOMEWORK, [
    'ID',
    'Subject',
    'Title',
    'Description',
    'Deadline',
    'Grade',
    'Room',
    'CreatedBy',
    'CreatedAt',
    'StatusJSON'
  ]);
  getOrCreateSheet(SHEET_BOOKINGS, [
    'ID',
    'Date',
    'StartTime',
    'EndTime',
    'Capacity',
    'Title',
    'Notes',
    'CreatedBy',
    'BookedJSON'
  ]);
  getOrCreateSheet(SHEET_USERS, [
    'Username',
    'FullName',
    'Role',
    'Grade',
    'Room',
    'ClassLabel',
    'LastLogin'
  ]);
}

function doGet(e) {
  try {
    initSheets();
    const action = (e && e.parameter && e.parameter.action) || 'getAll';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // ดึงข้อมูลการบ้าน
    if (action === 'getHomework' || action === 'getAll') {
      const hwSheet = getOrCreateSheet(SHEET_HOMEWORK);
      const rows = hwSheet.getDataRange().getValues();
      const homeworks = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i][0]) continue;
        let statusObj = {};
        try {
          statusObj = rows[i][9] ? JSON.parse(rows[i][9]) : {};
        } catch (err) {}
        homeworks.push({
          id: String(rows[i][0]),
          subject: String(rows[i][1]),
          title: String(rows[i][2]),
          description: String(rows[i][3]),
          deadline: String(rows[i][4]),
          grade: String(rows[i][5] || ''),
          room: String(rows[i][6] || ''),
          targetClass: rows[i][5] && rows[i][6] ? `${rows[i][5]}/${rows[i][6]}` : '',
          createdBy: String(rows[i][7]),
          createdAt: String(rows[i][8]),
          statusByUser: statusObj
        });
      }

      if (action === 'getHomework') {
        return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: homeworks }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // ดึงข้อมูลรอบการจอง
    if (action === 'getBookings' || action === 'getAll') {
      const bkSheet = getOrCreateSheet(SHEET_BOOKINGS);
      const rows = bkSheet.getDataRange().getValues();
      const bookings = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i][0]) continue;
        let bookedArr = [];
        try {
          bookedArr = rows[i][8] ? JSON.parse(rows[i][8]) : [];
        } catch (err) {}
        bookings.push({
          id: String(rows[i][0]),
          date: String(rows[i][1]),
          startTime: String(rows[i][2]),
          endTime: String(rows[i][3]),
          capacity: Number(rows[i][4]) || 1,
          title: String(rows[i][5]),
          notes: String(rows[i][6]),
          createdBy: String(rows[i][7]),
          bookedStudents: bookedArr
        });
      }

      if (action === 'getBookings') {
        return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: bookings }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // ดึงข้อมูลรายชื่อผู้ใช้งาน
    if (action === 'getUsers') {
      const userSheet = getOrCreateSheet(SHEET_USERS);
      const rows = userSheet.getDataRange().getValues();
      const users = [];
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i][0]) continue;
        users.push({
          username: String(rows[i][0]),
          fullName: String(rows[i][1]),
          role: String(rows[i][2]),
          grade: String(rows[i][3]),
          room: String(rows[i][4]),
          classLabel: String(rows[i][5]),
          lastLogin: String(rows[i][6])
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: users }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Google Sheets API is Ready' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    initSheets();
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    // 1. บันทึก / อัปเดตข้อมูลผู้ใช้งาน (ชื่อ-นามสกุล, ชั้น, ห้อง)
    if (action === 'saveUser' && data.user) {
      const sheet = getOrCreateSheet(SHEET_USERS);
      const rows = sheet.getDataRange().getValues();
      let foundIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.user.username)) {
          foundIndex = i + 1;
          break;
        }
      }

      const rowData = [
        data.user.username || '',
        data.user.name || '',
        data.user.role || '',
        data.user.grade || '',
        data.user.room || '',
        data.user.classLabel || '',
        new Date().toISOString()
      ];

      if (foundIndex > 0) {
        sheet.getRange(foundIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'User saved' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. เพิ่มการบ้านใหม่ (เฉพาะหัวหน้าห้อง)
    if (action === 'addHomework') {
      const sheet = getOrCreateSheet(SHEET_HOMEWORK);
      sheet.appendRow([
        data.id || ('hw-' + new Date().getTime()),
        data.subject || '',
        data.title || '',
        data.description || '',
        data.deadline || '',
        data.grade || '',
        data.room || '',
        data.createdBy || 'leader',
        data.createdAt || new Date().toISOString(),
        JSON.stringify(data.statusByUser || {})
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Homework added' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. แก้ไขการบ้าน (เฉพาะหัวหน้าห้อง)
    if (action === 'editHomework') {
      const sheet = getOrCreateSheet(SHEET_HOMEWORK);
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
          sheet.getRange(i + 1, 2).setValue(data.subject || '');
          sheet.getRange(i + 1, 3).setValue(data.title || '');
          sheet.getRange(i + 1, 4).setValue(data.description || '');
          sheet.getRange(i + 1, 5).setValue(data.deadline || '');
          if (data.grade) sheet.getRange(i + 1, 6).setValue(data.grade);
          if (data.room) sheet.getRange(i + 1, 7).setValue(data.room);
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Homework updated' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Homework not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 4. ลบการบ้าน (เฉพาะหัวหน้าห้อง)
    if (action === 'deleteHomework') {
      const sheet = getOrCreateSheet(SHEET_HOMEWORK);
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Homework deleted' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Homework not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 5. ปรับปรุงสถานะส่งการบ้าน (นักเรียน & หัวหน้า)
    if (action === 'updateHomeworkStatus') {
      const sheet = getOrCreateSheet(SHEET_HOMEWORK);
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
          let statusObj = {};
          try {
            statusObj = rows[i][9] ? JSON.parse(rows[i][9]) : {};
          } catch(e) {}
          statusObj[data.username] = data.status;
          sheet.getRange(i + 1, 10).setValue(JSON.stringify(statusObj));
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Status updated' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // 6. ครูเปิดรอบเวลาว่าง
    if (action === 'addBookingSlot') {
      const sheet = getOrCreateSheet(SHEET_BOOKINGS);
      sheet.appendRow([
        data.id || ('slot-' + new Date().getTime()),
        data.date || '',
        data.startTime || '',
        data.endTime || '',
        data.capacity || 1,
        data.title || '',
        data.notes || '',
        data.createdBy || 'teacher',
        JSON.stringify(data.bookedStudents || [])
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Slot created' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 7. นักเรียนจองคิว
    if (action === 'bookSlot') {
      const sheet = getOrCreateSheet(SHEET_BOOKINGS);
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
          const capacity = Number(rows[i][4]) || 1;
          let bookedArr = [];
          try {
            bookedArr = rows[i][8] ? JSON.parse(rows[i][8]) : [];
          } catch(e) {}

          const alreadyBooked = bookedArr.some(b => b.username === data.user.username);
          if (alreadyBooked) {
            return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'คุณได้จองรอบนี้ไปแล้ว' }))
              .setMimeType(ContentService.MimeType.JSON);
          }

          if (bookedArr.length >= capacity) {
            return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'รอบนี้มีผู้จองเต็มจำนวนแล้ว' }))
              .setMimeType(ContentService.MimeType.JSON);
          }

          bookedArr.push({
            username: data.user.username,
            name: data.user.name,
            role: data.user.role,
            grade: data.user.grade || '',
            room: data.user.room || '',
            bookedAt: new Date().toISOString()
          });

          sheet.getRange(i + 1, 9).setValue(JSON.stringify(bookedArr));
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Booked successfully', bookedStudents: bookedArr }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // 8. ยกเลิกการจอง
    if (action === 'cancelBooking') {
      const sheet = getOrCreateSheet(SHEET_BOOKINGS);
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
          let bookedArr = [];
          try {
            bookedArr = rows[i][8] ? JSON.parse(rows[i][8]) : [];
          } catch(e) {}

          bookedArr = bookedArr.filter(b => b.username !== data.username);
          sheet.getRange(i + 1, 9).setValue(JSON.stringify(bookedArr));
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Cancelled successfully' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // 9. ลบรอบการจอง
    if (action === 'deleteSlot') {
      const sheet = getOrCreateSheet(SHEET_BOOKINGS);
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.id)) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Slot deleted' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Action not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
