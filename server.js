const express = require('express');
const { JWT } = require('google-auth-library');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const credentials = require('./google-credentials.json');

const app = express(); // <-- Must be defined FIRST
app.use(express.json());

// Initialize Google Sheet connection
const serviceAccountAuth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your actual Google Sheet ID
const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

app.post('/api/attendance/checkin', async (req, res) => {
  try {
    const { studentId, studentName } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required.' });
    }

    const normalizedId = studentId.trim().toUpperCase();
    const todayStr = new Date().toLocaleDateString();

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // 1. Check if total participants reached the limit of 30
    const MAX_PARTICIPANTS = 30;
    if (rows.length >= MAX_PARTICIPANTS) {
      return res.status(403).json({
        error: 'Registration/Attendance is closed. Maximum limit of 30 participants reached.'
      });
    }

    // 2. Check if the student has already checked in today
    const alreadyCheckedIn = rows.some((row) => {
      const rowId = (row.get('Student ID') || '').trim().toUpperCase();
      const rowDate = row.get('Date');
      return rowId === normalizedId && rowDate === todayStr;
    });

    if (alreadyCheckedIn) {
      return res.status(400).json({
        error: `${studentName || normalizedId} has already checked in today.`
      });
    }

    // 3. Save to Google Sheets if under 30 limit and not duplicate
    await sheet.addRow({
      'Student ID': normalizedId,
      'Name': studentName,
      'Date': todayStr,
      'Timestamp': new Date().toLocaleString()
    });

    return res.status(200).json({
      message: `Check-in successful for ${studentName || normalizedId}.`
    });

  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ error: 'Failed to record attendance.' });
  }
});

const PORT = 5000; // Matches your frontend API_BASE port
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});google-credentials.json