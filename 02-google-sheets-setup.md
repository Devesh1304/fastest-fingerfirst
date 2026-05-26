# 02 — Google Sheets Question Bank + Apps Script API

## What we will do in this step
- Create a Google Sheet with MCQ questions in Gujarati
- Write a short Apps Script that turns the Sheet into a free JSON API
- Test the API URL in browser
- Save the URL for later use in `js/config.js`

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **"Blank"** to create a new sheet
3. Rename it: `KBC-FFF-Questions`

---

## Step 2 — Sheet Structure (6 columns only)

> ✅ No `type` column needed — all questions are MCQ!

**Row 1 = Header** (type exactly as shown):

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| question | item1 | item2 | item3 | item4 | correct |

---

## Step 3 — Import Sample Questions (Easiest way)

Instead of typing manually, import the ready-made CSV file:

1. In your Google Sheet → **File → Import**
2. Click **Upload** tab
3. Drag and drop `sample-questions.csv` from your project folder
4. Settings:
   - Import location: **Replace spreadsheet**
   - Separator type: **Comma**
   - Convert text to numbers → **OFF**
5. Click **Import data** ✅

Your sheet will have 10 ready sample questions!

---

## Step 4 — Understanding the Sheet

Each row = one question.  
Questions are grouped in **rounds of 5**:

| Rows | Round |
|---|---|
| 2 – 6  | Round 1 |
| 7 – 11 | Round 2 |
| 12 – 16 | Round 3 |
| ... | ... |

> 💡 So if you want 3 rounds → add 15 questions total (rows 2 to 16).

### The `correct` column

| Value | Means |
|---|---|
| `0` | item1 is correct |
| `1` | item2 is correct |
| `2` | item3 is correct |
| `3` | item4 is correct |

**Example:**
```
question  → ભારતનો રાષ્ટ્રીય પ્રાણી કયો છે?
item1     → વાઘ
item2     → સિંહ
item3     → હાથી
item4     → મોર
correct   → 0        ← item1 (વાઘ) is correct
```

---

## Step 5 — How to Type Gujarati in Google Sheets

**Option A — Google Input Tools (Easiest)**
1. Go to [google.com/inputtools/try](https://www.google.com/inputtools/try/)
2. Select **Gujarati**
3. Type in Roman → it converts to Gujarati automatically
4. Copy → paste into your Sheet cell

**Option B — Windows Gujarati Keyboard**
1. Settings → Time & Language → Language → Add a language → **Gujarati**
2. Press `Win + Space` to switch keyboard

**Option C — Write in English, add Gujarati before event**
Add questions in English first, replace with Gujarati text later.

---

## Step 6 — Open Apps Script

1. In your Google Sheet, click: **Extensions → Apps Script**
2. A new tab opens with a code editor
3. **Delete all existing code**
4. Paste the code from Step 7 below
5. Save with `Ctrl + S`
6. Name the project: `KBC-FFF-API`

---

## Step 7 — Apps Script Code

```javascript
function doGet() {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data  = sheet.getDataRange().getValues();

  var questions = [];

  // Start from row index 1 to skip the header row
  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    // Skip empty rows
    if (!row[0] || row[0].toString().trim() === '') continue;

    questions.push({
      question : row[0].toString().trim(),
      items    : [
        row[1].toString().trim(),
        row[2].toString().trim(),
        row[3].toString().trim(),
        row[4].toString().trim()
      ],
      correct  : parseInt(row[5].toString().trim(), 10)
    });
  }

  // Return JSON — GitHub Pages can fetch this directly
  return ContentService
    .createTextOutput(JSON.stringify(questions))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## Step 8 — Deploy as Web App

1. Click **"Deploy"** button (top right in Apps Script editor)
2. Click **"New deployment"**
3. Click ⚙️ gear icon → select **"Web app"**
4. Fill in settings:
   - **Description:** `KBC FFF Questions API`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` ← very important!
5. Click **"Deploy"**
6. Click **"Authorize access"** → choose your Google account → **Allow**
7. Copy the Web App URL:

```
https://script.google.com/macros/s/AKfycbXXXXXXXXXXXX/exec
```

---

## Step 9 — Test the API in Browser

Open the URL in your browser. You should see:

```json
[
  {
    "question": "ભારતના પ્રથમ વડાપ્રધાન કોણ હતા?",
    "items": ["સરદાર પટેલ", "જવાહરલાલ નેહરુ", "ડૉ. આંબેડકર", "મહાત્મા ગાંધી"],
    "correct": 1
  },
  {
    "question": "ગુજરાતની રાજધાની કઈ છે?",
    "items": ["સુરત", "ગાંધીનગર", "અમદાવાદ", "વડોદરા"],
    "correct": 1
  }
  ...
]
```

✅ If you see this — your API is working!

---

## Step 10 — Save the URL in `config.js`

Open `js/config.js` and add:

```javascript
// Your Apps Script Web App URL
const SHEETS_API_URL = "https://script.google.com/macros/s/YOUR_ID_HERE/exec";
```

> We will add Firebase config in the next step.

---

## ⚠️ Important Notes

**After editing questions in the Sheet:**
The API automatically reflects the latest data — no need to redeploy.

**After editing the Apps Script code:**
1. Deploy → Manage deployments
2. Click edit ✏️ icon
3. Change version to **"New version"**
4. Click **Deploy**

---

## ✅ Checklist

- [ ] Google Sheet created with 6-column header
- [ ] Sample questions imported from `sample-questions.csv`
- [ ] Apps Script code pasted and saved
- [ ] Deployed as Web App with "Anyone" access
- [ ] API URL tested in browser — shows JSON ✅
- [ ] `SHEETS_API_URL` added to `js/config.js`

---

## What's Next?

➡️ **`03-firebase-setup.md`** — Create Firebase project and Realtime Database to sync game state between all players in real time.
