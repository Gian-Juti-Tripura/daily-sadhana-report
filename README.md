# Advaita VOICE Hub (v12.0)
### Vedic Ashram Management, Operational Automation & Spiritual Analytics Ecosystem

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript 6](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS 3.4](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Capacitor 6](https://img.shields.io/badge/Capacitor-Android_API_34-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

---

## 🌟 Executive Overview

**Advaita VOICE Hub** is a cross-platform (Progressive Web Application & Native Android) enterprise-grade operational management and spiritual analytics ecosystem built for **Advaita VOICE (Vedic Oasis for Inspiration, Culture & Education)**, a premier residential spiritual academy affiliated with the **University of Chittagong** and the **ISKCON Youth Forum (IYF)**.

The system automates daily ashram operations, eliminates physical paper ledgers and spreadsheets, and provides real-time visibility across:
1. **Deterministic 12-Day Seva Rotation & Emergency Difficulty-Balanced Allocation**
2. **Real-time Sadhana Tracking & Automated Disciplinary Strikes**
3. **Dining Hall Prasad Attendance & Dynamic Prorated Bazar Finance Ledger**
4. **Devotee Master Directory, Lineage Profiles & Academic Tracker**
5. **6-Tier 854-Topic Vedic Curriculum Explorer & 4-Year Ashram Roadmap**
6. **Sebananda Vedic E-Library & Audio/Video Discourses Archive**
7. **One-Tap Unicode WhatsApp Broadcasting & Client-Side PDF Statement Export**
8. **Native Android Hardware Integration (Haptics, Alarms, OneSignal Push Alerts)**

---

## 🚀 Key Feature Modules

### 1. 🔄 Seva Cycle Engine & Emergency Chart
* **Deterministic 12-Day Cyclical Rotation:** Automatically calculates and rotates daily temple services using modular arithmetic $(\text{cycleOrder} + \text{dayOfMonth} + 3) \pmod N$, shifting duty forward every midnight without storing static daily schedules in the database.
* **Hierarchical Absence & Dynamic Shift Algorithm:** Differentiates between single-day emergency absences and continuous leaves. Automatically cascades replacements using a priority fallback pool `[10, 4, 6, 11, 2, 8, 7]`.
* **Emergency 12-Service Balanced Distribution:** When $\le 6$ members are present in the ashram (e.g., during semester breaks or festivals), the emergency engine activates time-relevant duty bundling and balances all 12 services by difficulty levels (`HEAVY`, `MEDIUM_HIGH`, `MEDIUM`, `LIGHT_MEDIUM`, `LIGHT`), ensuring an equal workload per devotee without leaving any temple service unassigned.

### 2. 📿 Sadhana & Disciplinary Auto-Strike System
* **Personal Sadhana Scorecard:** Tracks 4:00 AM wake-up punctuality, 10:00 PM sleep curfew, 16-round japa milestones (completed before 6:30 AM, 8:30 AM, and 10:00 PM), Mangalarati attendance, Srimad-Bhagavatam class participation, and scripture reading/hearing minutes.
* **Live Disciplinary Auto-Strikes:** Evaluates daily compliance in real time. Unexcused infractions (late bed, late wake-up, unexcused absence from Mangalarati or class) automatically increment monthly strikes.
* **Escalation & Group Degradation:** Visual indicator badges:
  * 🟢 **0 Strikes:** 100% Exemplary Sadhana
  * 🟡 **1 Strike:** Warning Tier 1
  * 🟠 **2 Strikes:** Warning Tier 2 (Strict Probation)
  * 🔴 **3+ Strikes:** Automatic degradation from `VOICE` to `LOTUS` group tier, alerting the ashram Counselor.

### 3. 🍴 Prasad & Meal Accounting Suite
* **Dining Hall Attendance Roster:** Residents book daily meals (Breakfast, Lunch, Dinner) with guest count multipliers and Ekadashi fasting toggles.
* **Bazar Expense Ledger:** Itemized grocery, dairy, produce, and gas cylinder purchase tracker attributed to designated purchasers.
* **Dynamic Prorated Meal Rate Calculation:**
  $$\text{Meal Rate} = \frac{\sum \text{Bazar Expenses}}{\sum \text{Total Consumed Meals}}$$
* **Audit-Grade Client-Side PDF Export:** Compiles monthly balances, deposits (Cash, bKash, Nagad, Bank), and consumption statements into downloadable vector PDFs using `html2canvas` and `jsPDF`.

### 4. 👥 Devotee Master Directory & Profiles
* **Comprehensive Profiles:** Academic details (University of Chittagong department, batch, session), spiritual lineage (Counselor, spiritual vows, diksha status), blood group, and emergency contacts.
* **Custom Profile Modal:** Personal photo uploads, spiritual avatar pickers, and account linking for authenticated users.

### 5. 🎓 6-Tier 854-Topic Vedic Curriculum Explorer
* **Tiered Learning Modules:**
  * **Level 1:** Discover Yourself (DYS)
  * **Level 2:** Spiritual Scientist
  * **Level 3:** Positron
  * **Level 4:** Protons
  * **Level 5:** Bhakti Shastri
  * **Level 6:** Sri Caitanya-caritamrta (CC)
* **4-Year VOICE Academic & Camp Roadmap:** Interactive stage progression tracking 13 residential youth retreats, leadership seminars, and philosophical milestones.

### 6. 📚 Sebananda Vedic E-Library & Resources
* Curated searchable digital library containing sacred literatures, study notes, and commentary.
* Unified audio and video lecture archive for philosophical discourses.

### 7. 📢 Automated WhatsApp Broadcasting & Push Notifications
* **One-Tap Unicode WhatsApp Roster:** Pre-formats daily seva assignments, absences, and replacements with status badges (`🟢 PRESENT`, `🔴 ABSENT`, `🔄 REPLACED`) ready for clipboard or direct sharing.
* **Morning Program Verdict Broadcast:** Formats daily wake-up and Mangalarati attendance summaries.
* **Push Notifications:** OneSignal cloud push broadcasts and local scheduled reminders (8:00 PM evening roster reminder, 4:00 AM wake-up alarm).

### 8. 🎨 Divine Theme & UI/UX Design System
* **Bilingual Toggle:** Instant real-time UI localization between English and Bengali (`BN` / `EN`).
* **Devotional Atmosphere:** Subtle Sri Krishna Vrindavan backdrop, falling flower particle animation (`FallingFlowers.tsx`), and customizable dynamic theme auras across light and dark modes.
* **Mobile-First Ergonomics:** Fixed 6-tab bottom navigation bar (`BottomNavBar.tsx`) and an edge-to-edge 5×3 quick portal launcher (`GlobalSearchBar.tsx`).

---

## 🛠 Technology Stack

| Layer | Technology | Version / Specification |
|---|---|---|
| **Core Framework** | React | `v19.2.8` |
| **Language** | TypeScript | `v6.0.2` |
| **Build Tool & Bundler** | Vite | `v8.2.0` |
| **Styling** | Tailwind CSS | `v3.4.17` |
| **Icons** | Lucide React | `v1.31.0` |
| **Routing** | React Router | `v7.18.2` |
| **Database & Auth** | Supabase (PostgreSQL 15) | `@supabase/supabase-js v2.112.2` |
| **Mobile Runtime** | Capacitor (Android) | `@capacitor/core v6.0.0` |
| **Push Notifications** | OneSignal + Local Notifications | `@onesignal/capacitor-plugin v1.0.4` |
| **PDF Generation** | jsPDF + html2canvas | `jspdf v4.2.1` / `html2canvas v1.4.1` |
| **Code Quality** | Oxlint + TypeScript Compiler | `oxlint v1.75.0` |

---

## 📦 Prerequisites

Ensure you have the following installed in your development environment:
* **Node.js**: `v18.0.0+` (Node 20 or 22 LTS recommended)
* **npm** or **pnpm** / **yarn**
* **Android Studio & Android SDK**: (API Level 24 minimum, API Level 34 target SDK)
* **Java Development Kit (JDK)**: JDK 17 or JDK 21 (for native Android builds)
* **Supabase Account**: A provisioned PostgreSQL project on Supabase

---

## ⚙️ Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Gian-Juti-Tripura/VOICE-Service-Cycle.git
cd VOICE-Service-Cycle
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ONESIGNAL_APP_ID=your-onesignal-app-id
```

### 4. Database Schema Setup (Supabase PostgreSQL)
Run the migration scripts in your Supabase SQL Editor:
* `members`: `(id UUID, fullName TEXT, phone TEXT, email TEXT, dob DATE, userId UUID, isActive BOOLEAN, cycleOrder INT, role TEXT, groupTier TEXT, department TEXT, batch TEXT, bloodGroup TEXT, avatarUrl TEXT, spiritualAvatar TEXT)`
* `services`: `(id TEXT, nameEn TEXT, nameBn TEXT, descEn TEXT, descBn TEXT, timing TEXT, isActive BOOLEAN, difficulty TEXT, weight NUMERIC)`
* `assignment_overrides`: `(id UUID, dateStr TEXT, memberId UUID, serviceId TEXT, status TEXT, absenceReason TEXT, replacementMemberId UUID, managerId UUID, timestamp TIMESTAMPTZ)`
* `sadhana_entries`: `(id UUID, devoteeId UUID, dateStr TEXT, wakeUpTime TEXT, wokeUpOnTime BOOLEAN, sleepTime TEXT, sleptOnTime BOOLEAN, morningProgramOnTime BOOLEAN, mangalaratiAttended BOOLEAN, morningClassAttended BOOLEAN, japaBefore630 INT, japaBefore830 INT, japaBefore1000 INT, readingMinutes INT, hearingMinutes INT, calculatedScore INT)`
* `meal_overrides`: `(id UUID, memberId UUID, date DATE, breakfast BOOLEAN, lunch BOOLEAN, dinner BOOLEAN, guestCount INT, isEkadashiFasting BOOLEAN)`
* `bazar_expenses`: `(id UUID, date DATE, month TEXT, buyer TEXT, category TEXT, items TEXT, amount NUMERIC)`
* `payments`: `(id UUID, memberId UUID, amount NUMERIC, date DATE, month TEXT, method TEXT, trxId TEXT)`

### 5. Launch the Local Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 📱 Building the Native Android APK

The project uses Capacitor 6 to compile the web application into a high-performance native Android application.

### 1. Build Production Web Bundle
```bash
npm run build
```

### 2. Synchronize Assets with Android Native Project
```bash
npx cap sync android
```

### 3. Generate App Icons & Splash Screens (Optional)
```bash
npx @capacitor/assets generate --android
```

### 4. Compile Standalone Android APK
Navigate to the `android` directory and compile via Gradle:
```bash
cd android
./gradlew assembleDebug
```
The compiled APK will be output to:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
*Current pre-compiled releases (such as `Advaita-VOICE-Hub-v12.apk`) are located directly in the project root.*

---

## 📂 Project Architecture

```
VOICE-Service-Cycle/
├── android/                   # Capacitor Native Android Project (Gradle & Java)
├── docs/                      # Architectural manuals & PDF documentation
│   ├── Advaita_VOICE_Hub_Complete_System_Documentation.md
│   ├── Advaita_VOICE_Hub_Complete_System_Documentation.pdf
│   ├── VOICE_Service_Management_Core_Manual_EN.md
│   └── VOICE_Service_Management_Core_Manual_BN.md
├── public/                    # Static public assets, icons, manifest
├── scripts/                   # System automation & PDF generation scripts
├── src/
│   ├── components/            # Reusable UI & Layout Components
│   │   ├── effects/           # FallingFlowers.tsx, dynamic auras
│   │   ├── layout/            # Navbar, BottomNavBar, FloatingActionBar
│   │   ├── pwa/               # PWA InstallPromptBanner
│   │   └── theme/             # CornerThemeButton, ThemeCustomizerModal
│   ├── context/               # React Contexts (AuthContext, LanguageContext)
│   ├── data/                  # Static master data (Syllabus, Camps, Courses)
│   ├── pages/                 # Application Page Modules
│   │   ├── announcements/     # Ashram notices & alerts
│   │   ├── auth/              # Login, Registration & Password Reset
│   │   ├── calendar/          # Vaishnava Ekadashi & Festival Calendar
│   │   ├── camps/             # 13 Residential Youth Retreats & Seminars
│   │   ├── counselor/         # CounselorDesk & AshramDisciplineAudit
│   │   ├── library/           # Sebananda Vedic E-Library
│   │   ├── management/        # Advaita Executive Committee & Org Chart
│   │   ├── manager/           # ManagerDashboard, EmergencyRoster, Services
│   │   ├── meals/             # MealDashboard, Attendance, Bazar, Reports
│   │   ├── member/            # MemberDashboard & Daily Seva Duty
│   │   ├── preaching/         # PreachersToolkit & Student Follow-ups
│   │   ├── profiles/          # DevoteeProfilesPage & Directory
│   │   ├── resources/         # UnifiedLectureLibrary
│   │   ├── sadhana/           # SadhanaTracker & 16-Round Milestones
│   │   ├── syllabus/          # 6-Tier 854-Topic SyllabusExplorer
│   │   └── HubHome.tsx        # Central Command Hub
│   ├── types/                 # TypeScript type definitions & interfaces
│   └── utils/                 # Algorithmic engines & database bridges
│       ├── cycleEngine.ts          # 12-day deterministic rotation & cascade
│       ├── emergencyCycleEngine.ts # Emergency difficulty balancing (<=6)
│       ├── localDb.ts              # Offline storage & IndexedDB synchronization
│       ├── notificationScheduler.ts# Local push notification scheduling
│       └── onesignal.ts            # OneSignal cloud push integration
├── package.json               # Dependencies & build scripts
├── SDLC.md                    # Detailed Software Development Life Cycle specification
└── vite.config.ts             # Vite bundler, PWA & Rollup chunking rules
```

---

## 🔒 Security & Governance

* **Role-Based Access Control (RBAC):**
  * `ADMIN`: Global system configuration, user tier promotions, service definitions, master audit.
  * `INTERNAL_MANAGER`: Daily seva overrides, emergency chart generation, bazar expense logging, disciplinary reviews.
  * `COUNSELOR`: Student sadhana oversight, discipline audit review, spiritual mentorship.
  * `MEMBER`: Personal sadhana entries, meal attendance toggles, personal seva duty view.
* **Row-Level Security (RLS):** Supabase PostgreSQL policies enforce data separation and prevent unauthorized record modification.
* **Offline-Resilient Synchronization:** Offline changes are queued locally in `localDb.ts` with Last-Write-Wins (LWW) conflict resolution upon network reconnection.

---

## 📄 License & Attribution

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

**Lead Engineer & Architect:**  
**Gian Juti Tripura** (`gianjuti.csecu@gmail.com`)  
*Department of Computer Science & Engineering, University of Chittagong*  
*Advaita VOICE Technology Division*
