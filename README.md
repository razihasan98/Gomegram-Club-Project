# গোমগ্রাম স্বপ্নসিঁড়ি তরুণ সংঘ (Gomegram Swapnosiri Tarun Sangha)
### Club Management System & Public Web Portal

A full-stack, responsive web application for managing club membership, financial accounting, event contributions, dues ledger, photo albums, and public community portal.

---

## 🚀 Quick Setup & Run Guide (কিভাবে রান করবেন)

প্রজেক্টটি রান করার জন্য ৩টি সহজ ধাপ নিচে দেওয়া হলো:

---

### ১. ডেটাবেস সেটআপ ও ব্যাকএন্ড চালু করা (Backend & Database)

ব্যাকএন্ডটি **Laravel 11 (PHP)** এবং **SQLite** (অথবা MySQL) দিয়ে তৈরি।

#### কমান্ডসমূহ:

1. টার্মিনাল ওপেন করে `backend` ফোল্ডারে প্রবেশ করুন:
   ```bash
   cd backend
   ```

2. ডিপেন্ডেন্সি ইন্সটল করুন (যদি করা না থাকে):
   ```bash
   composer install
   ```

3. পরিবেশ ফাইল `.env` তৈরি করুন (যদি না থাকে):
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. ডেটাবেস ফাইল তৈরি ও মাইগ্রেশন/সীডার রান করুন (Default Admin ও ডেমো মেম্বার ডাটা লোড হবে):
   ```bash
   php artisan migrate:fresh --seed
   ```

5. ব্যাকএন্ড সার্ভার চালু করুন:
   ```bash
   php artisan serve --port=8000
   ```
   > **Backend API URL:** `http://127.0.0.1:8000`

---

### ২. ফ্রন্টএন্ড চালু করা (Frontend)

ফ্রন্টএন্ডটি **React, TypeScript, TailwindCSS, এবং Vite** দিয়ে তৈরি।

#### কমান্ডসমূহ:

1. একটি নতুন টার্মিনাল ওপেন করে `frontend` ফোল্ডারে যান:
   ```bash
   cd frontend
   ```

2. প্যাকেজ/ডিপেন্ডেন্সি ইন্সটল করুন:
   ```bash
   npm install
   ```

3. ডেভেলপমেন্ট সার্ভার রান করুন:
   ```bash
   npm run dev
   ```
   > **Frontend Website URL:** `http://localhost:5173`

---

### ৩. অ্যাডমিন লগইন ক্রেডেনশিয়াল (Default Admin Credentials)

- **Login URL:** `http://localhost:5173/admin/login`
- **Email:** `admin@swapnosiri.org`
- **Password:** `admin123`

*(লগইন করার পর Settings পেজ থেকে আপনি আপনার নিজস্ব ইমেইল এবং পাসওয়ার্ড পরিবর্তন করতে পারবেন)*

---

### ৪. গুগল ড্রাইভ ব্যাকআপ সেটআপ (Google Drive Setup)

অ্যাডমিন প্যানেল থেকে ছবি আপলোড করার সময় তা সরাসরি আপনার গুগল ড্রাইভে সেভ করার জন্য নিচের কমান্ডটি রান করুন:

1. `backend` ফোল্ডারে টার্মিনাল ওপেন করে নিচের কমান্ডটি দিন:
   ```bash
   php artisan gdrive:auth
   ```
2. টার্মিনালে একটি লিংক দেওয়া হবে। সেই লিংকটি ব্রাউজারে ওপেন করে আপনার জিমেইল দিয়ে লগইন করে পারমিশন দিন।
3. গুগল আপনাকে একটি **Authorization Code** দিবে। 
4. কোডটি কপি করে এনে টার্মিনালে পেস্ট করে Enter দিন। 

ব্যাস! গুগল ড্রাইভ সফলভাবে কানেক্ট হয়ে যাবে।

---

## 🛠️ এক নজরে প্রয়োজনীয় কমান্ডসমূহ (Cheat Sheet)

| কাজের বিবরণ | কমান্ড | ডিরেক্টরি |
| :--- | :--- | :--- |
| **Backend Dependencies** | `composer install` | `backend/` |
| **Database Migration & Seed** | `php artisan migrate:fresh --seed` | `backend/` |
| **Start Backend Server** | `php artisan serve --port=8000` | `backend/` |
| **Frontend Dependencies** | `npm install` | `frontend/` |
| **Start Frontend Dev** | `npm run dev` | `frontend/` |
| **Build Frontend Production** | `npm run build` | `frontend/` |

---

## 🌟 প্রধান ফিচারসমূহ (Key Features)

1. **পাবলিক পোর্টাল (Public Portal)**:
   - হোমপেজ: স্পিরিচুয়াল স্যাফ্রন-ডার্ক থিম, বার্ষিক পূজা ও কার্যক্রমের মেট্রিকস।
   - মেম্বার ডিরেক্টরি: সকল মেম্বারের তালিকা, বকেয়া লেজার ও সার্চ/ফিল্টার।
   - ইভেন্টস পেজ: পূজা ও উৎসবের বিস্তারিত, ভেন্যু ও অংশগ্রহণের ফি।
   - ফটো গ্যালারি: ক্যাটাগরি অনুযায়ী ফিল্টার ও লাইটবক্স প্রিভিউ।
   - যোগাযোগ ও সহায়তা: কমিটি যোগাযোগ ও সামাজিক লিঙ্ক।

2. **অ্যাডমিন ম্যানেজমেন্ট প্যানেল (Admin Panel)**:
   - **ড্যাশবোর্ড**: মোট মেম্বার, কালেকশন কাউন্টার, টপ বকেয়া অ্যালার্ট ও সাম্প্রতিক পেমেন্ট।
   - **মেম্বার ম্যানেজমেন্ট**: নতুন মেম্বার অ্যাড, এডিট, ডিলিট এবং পূর্বের বকেয়া অ্যাডজাস্টমেন্ট।
   - **ইভেন্টস ও ফি**: নতুন ইভেন্ট তৈরি ও সকল মেম্বারকে স্বয়ংক্রিয়ভাবে ফি অ্যাসাইন।
   - **পেমেন্ট ও লেজার**: তাৎক্ষণিক পেমেন্ট এন্ট্রি, স্বয়ংক্রিয় বকেয়া ক্যালকুলেশন ও মানি রিসিট প্রিন্ট।
   - **রিপোর্টস ও অডিট**: ইভেন্ট-ভিত্তিক পেমেন্ট শিট, বকেয়া তালিকা (CSV এক্সপোর্ট সহ) ও মেম্বার স্টেটমেন্ট।
   - **ক্লাব সেটিংস ও সিকিউরিটি**: অ্যাডমিন ইমেইল ও পাসওয়ার্ড পরিবর্তন, প্রাইভেসী সেটিংস।
