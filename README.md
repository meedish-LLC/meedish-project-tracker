# Nexus Project Tracker

A beautiful, glassmorphic project tracker that uses Google Sheets as a database backend.

## Features
- **Premium Design:** Glassmorphism UI, animated mesh gradients, and dark mode aesthetic.
- **Mock Login System:** Simple frontend gating (demo purposes).
- **Google Sheets Backend:** Seamlessly integrates with Google Apps Script to save and fetch projects.

## How to Connect to Google Sheets

To make this app store data in your real Google Sheets, follow these steps:

1. **Create a Google Sheet:**
   - Go to [Google Sheets](https://sheets.new) and create a new spreadsheet.
   - Name the first sheet "Projects".
   - Set up the following headers in the first row (A1 to E1): `id`, `name`, `status`, `dueDate`, `createdAt`.

2. **Add Apps Script:**
   - In your Google Sheet, click on `Extensions` > `Apps Script`.
   - Delete the default code and paste the contents of `google_apps_script.gs` (included in this folder).
   - Save the project (Ctrl+S).

3. **Deploy the Web App:**
   - Click the **Deploy** button in the top right corner and select **New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Under "Execute as", select **Me**.
   - Under "Who has access", select **Anyone** (this is required for CORS).
   - Click **Deploy**. (You may need to authorize access to your Google Account).
   - Copy the **Web app URL** generated at the end.

4. **Link to Frontend:**
   - Open `app.js` in your code editor.
   - Replace the value of `GOOGLE_APP_SCRIPT_URL` on line 6 with the Web App URL you just copied.
   - The app will now automatically sync with your Google Sheet!

## Running Locally
You can open `index.html` directly in your browser or run a simple local server using Python or Node.js.
