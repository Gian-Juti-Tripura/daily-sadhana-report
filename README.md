# Daily Sadhana Report & Digital Sadhana Card System (v1.0)
### ISKCON Youth Forum (IYF) • Advaita VOICE Ashram

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript 6](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS 3.4](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Capacitor 6](https://img.shields.io/badge/Capacitor-Android-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

---

## 🌟 Overview

The **Daily Sadhana Report & Digital Sadhana Card** system is a specialized, lightweight, cross-platform application (PWA & Android) designed for residential devotees, youth forums, and counselees of **Advaita VOICE** and the **ISKCON Youth Forum (IYF)**.

It simplifies and digitizes daily and weekly spiritual practice tracking according to the authentic **175-Mark Sadhana Matrix System**, providing instant WhatsApp broadcasting, automated scoring, counselor auditing, and cloud synchronization.

---

## 🚀 Key Features

### 1. 📿 Daily Sadhana Report
* **Body Regulation (75 Marks):** Sleep curfew (before 10:30 PM), wake-up discipline (before 4:00 AM), and controlled day rest (<= 30 min).
* **Soul Culture (75 Marks):**
  * 16 rounds of Hare Krishna Mahamantra japa with completion timestamp tracking.
  * Srila Prabhupada & Vaishnava literature study with chapter/note logs.
  * Lecture hearing breakdown: Srila Prabhupada, Gurumaharaja, and other Vaishnava speakers.
* **Morning Program Attendance (25 Marks):** Mangalarati, Nrsimharati, Tulasi Arati & Parikrama, watering Vrinda devi, and Siksastakam / 10 offenses recital.
* **Seva & Academic Tracking:** Ashram daily service logging and academic university study hours.

### 2. 📊 Digital Sadhana Card (7-Day Weekly Matrix)
* **Interactive Weekly Matrix:** Full Saturday–Friday digital grid recording marks across all nine core practices.
* **Dynamic Scale Customizer:** Supports Scale 1, Scale 2, Scale 3, and Scale 4 difficulty baselines with customizable scoring weights.
* **Automatic Summary Calculations:** Weekly body percentage, soul percentage, aggregate score, and performance grade (A+, A, B, C).

### 3. 💬 WhatsApp Tree-Listing Broadcast
* Generates clean, emoji-free, hierarchical tree formatted reports (`├`, `└`, `│`) for daily status sharing.
* Generates concise 6-metric Counselee Weekly Reports with one-tap clipboard copy and direct WhatsApp Web/App launcher.

### 4. 🖨️ Client-Side Vector PDF Export
* High-performance programmatic **jsPDF** vector engine generating printable A4 reports:
  * No visual distortion or screenshot glitches.
  * Structured listing format without heavy progress bars.
  * Official ISKCON Youth Forum header and counselor verification block.

### 5. ☁️ Offline-First Architecture & Supabase Sync
* Instant local caching in browser `localStorage` ensuring zero downtime without an internet connection.
* Real-time background sync with Supabase PostgreSQL (`sadhana_logs` table).
* Portable JSON export and import for full offline data backup and restoration.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript 6, Vite 8
* **Styling:** Tailwind CSS 3.4, Lucide React Icons
* **Database & Auth:** Supabase (`@supabase/supabase-js`)
* **PWA Engine:** `vite-plugin-pwa` (ServiceWorker offline cache)
* **Mobile Runtime:** Capacitor 6 (`@capacitor/android`, `@capacitor/core`)
* **PDF Generation:** `jspdf`

---

## 📦 Getting Started

### Local Development

```bash
# Clone the repository
git clone https://github.com/Gian-Juti-Tripura/daily-sadhana-report.git
cd daily-sadhana-report

# Install dependencies
npm install

# Start local dev server
npm run dev
```

### Production Build

```bash
npm run build
```

---

## 🌐 Deployment (Vercel & PWA)

1. Import this repository into [Vercel](https://vercel.com/new).
2. Set Environment Variables:
   * `VITE_SUPABASE_URL` = your Supabase URL
   * `VITE_SUPABASE_ANON_KEY` = your Supabase anon API key
3. Deploy! Vercel automatically creates your live production URL with PWA install prompts.

---

## 📱 Android App Build (Capacitor)

```bash
# 1. Build web bundle
npm run build

# 2. Add Android platform (first time only)
npx cap add android

# 3. Sync web assets to Android
npx cap sync android

# 4. Open in Android Studio
npx cap open android
```

---

## 📜 License

This project is licensed under the MIT License — dedicated to the service of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada and the ISKCON Youth Forum.
