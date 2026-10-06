# 🕉️ গোমগ্রাম স্বপ্নসিঁড়ি তরুণ সংঘ (Gomegram Swapnosiri Tarun Sangha)
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

## 🛠️ এক নজরে প্রয়োজনীয় কমান্ডসমূহ (Cheat Sheet)

| কাজের বিবরণ | কমান্ড | ডিরেক্টরি |
| :--- | :--- | :--- |
| **Backend Dependencies** | `composer install` | `backend/` |
| **Database Migration & Seed** | `php artisan migrate:fresh --seed` | `backend/` |
| **Start Backend Server** | `php artisan serve --port=8000` | `backend/` |
| **Frontend Dependencies** | `npm install` | `frontend/` |
| **Start Frontend Dev** | `npm run dev` | `frontend/` |
| **Build Frontend Production** | `npm run build` | `frontend/` |
