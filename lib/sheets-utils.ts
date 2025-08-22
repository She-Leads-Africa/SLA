import { google } from 'googleapis'

export async function getSheetsClient() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    // Use the auth client directly
    return google.sheets({ version: 'v4', auth })
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error)
    throw error
  }
}

// Append data to a Google Sheet
export async function appendToSheet(spreadsheetId: string, range: string, values: any[][]) {
  try {
    const sheets = await getSheetsClient()
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    })

    console.log('Data appended to sheet:', response.data)
    return response.data
  } catch (error) {
    console.error('Error appending to sheet:', error)
    throw error
  }
}

// Get headers from a sheet
export async function getSheetHeaders(spreadsheetId: string, range: string) {
  try {
    const sheets = await getSheetsClient()
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    return response.data.values?.[0] || []
  } catch (error) {
    console.error('Error getting sheet headers:', error)
    throw error
  }
}

// Initialize sheet with headers
export async function initializeSheet(spreadsheetId: string) {
  try {
    const headers = [
      'Timestamp',
      'Applicant ID',
      'Application ID',
      'Full Name',
      'Email',
      'Phone Number',
      'Date of Birth',
      'Location',
      'Location Type',
      'Academic Qualification',
      'Student Level',
      'Employment Status',
      'Is Displaced',
      'Has Disability',
      'Disability Type',
      'Has Jobberman Certificate',
      'Referral Source',
      'Course Name',
      'Pathway',
      'Has Business',
      'Business Age',
      'Business Sector',
      'Company Name',
      'Taken Booster Course',
      'Work Interest',
      'Has Formal Training',
      'Familiarity Scale',
      'Has Used Tools',
      'Tools Used',
      'Course Specific Answer',
      'Social Media Platforms',
      'Digital Strategies',
      'Expectations',
      'Application Ease Rating'
    ]

    const sheets = await getSheetsClient()
    
    // Clear existing data and add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1:AE1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    })

    console.log('Sheet initialized with headers')
  } catch (error) {
    console.error('Error initializing sheet:', error)
    throw error
  }
}