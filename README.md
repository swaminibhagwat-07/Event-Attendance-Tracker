# CampusGate | Event Attendance & Live Barcode / QR Scanner

A modern, responsive, and robust **Event Attendance Tracker & Gate Entry Verification System** built with **React**, **TypeScript**, **Tailwind CSS**, and **html5-qrcode**.

---

## 🌟 Live Camera Barcode/QR Scanner & PRN Workflow (New!)

### 1. Backend Database Matrix (Req 1)
- Every student record is mapped to a unique **College PRN** (Permanent Registration Number), e.g. `PRN2022001`, `PRN2023015`, `PRN2021034`, etc.
- Schema:
  - `prn`: College Permanent Registration Number
  - `name`: Full Student Name
  - `email`: College Email Address
  - `year`: Academic Cohort (1st, 2nd, 3rd, 4th Year)
  - `branch`: Department Engineering Discipline
  - `phone`: 10-digit Contact Number
  - `isPresent`: Attendance boolean flag
  - `checkInTime`: Exact gate check-in timestamp

### 2. Camera Integration (Req 2)
- Uses the industry standard **`html5-qrcode`** library to stream the device webcam directly inside the browser.
- Interactive camera viewfinder with corner alignment brackets and an animated moving green laser scan line.
- Start / Stop camera stream toggle button to conserve device battery and system resources when idle.
- Automatic device enumeration with environment/user facing mode support.

### 3. Scanned PRN Lookup Workflow (Req 3)
- When a student's ID barcode or QR code is presented to the camera:
  1. The raw PRN string is decoded in real time.
  2. The database matrix is instantly searched for an exact match.
  3. **If Found**:
     - Auto-populates the verification panel with their full **Name**, **Email**, **Year**, **Branch**, and **PRN**.
     - Shows their current attendance status (Absent vs Present).
     - Displays a large, high-contrast **"Mark as Present"** button.
     - Triggers an auditory check-in chime (Web Audio API) and visual confetti celebration.
  4. **If Not Found**:
     - Displays a distinct, high-visibility **"PRN Not Registered"** alert banner with the scanned PRN number and explanation.

### 4. Text Input Backup (Req 4)
- A prominent manual text field is positioned directly beneath the camera view window.
- Organizers can quickly type a student's PRN if the physical card barcode is scratched or the camera cannot focus.
- Pressing Enter or clicking "Lookup PRN" executes the exact same verification workflow.

### 5. Instant Persistence & Dashboard Metrics (Req 5)
- All check-ins and registrations immediately persist in `localStorage` under `event_attendance_students_v3`.
- Changes instantly reflect in the **All Registrations** table and dynamically update the **Year-wise** and **Branch-wise** analytics in the **Dashboard**.

### 6. Built-in Barcode Generator & Simulator (Testing Aid)
- Click **"🪪 Test Barcode Generator"** to open a modal that renders realistic Student ID cards with scannable 1D barcodes on screen.
- Use the quick test buttons to simulate scanning valid PRNs (`PRN2022001`, `PRN2021034`, `PRN2023015`) or an unregistered PRN (`PRN9999999`) with a single click.

---

## 🚀 How to Run Locally

Run Python's built-in HTTP server:
```bash
python -m http.server 3000
```
Open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**
*(Ensure camera permissions are allowed when prompted by your browser).*
