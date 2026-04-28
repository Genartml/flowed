# 🚀 Flowled User Guide & Architecture

Welcome to Flowled! This document explains how the app works, the core features you need to focus on, and what can be simplified or changed in the future.

## 🔑 Firebase Rules Fix (Crucial)
If data is disappearing when you refresh the page, it means Firestore is blocking your saves due to its security rules. 
To fix this instantly:
1. Go to your [Firebase Console](https://console.firebase.google.com/).
2. Click on **Firestore Database** in the left menu.
3. Click the **Rules** tab at the top.
4. Replace the existing text with this exact block:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Allows unrestricted read and write (Since this is a personal app for you)
      allow read, write: if true;
    }
  }
}
```
5. Click **Publish**. Within 1 minute, all your saves will start persisting permanently!

---

## 🎯 How to Use Flowled (Core Features)

Flowled is divided into 4 main tools. You can switch between your **Genartml Agency** and your **Personal Brand** using the dropdown at the top right.

### 1. The Dashboard (`/dashboard`)
- **What it does:** Your high-level overview. Shows your runway (how many months of cash you have left), burn rate, and a quick summary of recent transactions.
- **How to use it:** Just view it. It automatically calculates your runway by taking your total funds and dividing it by your monthly burn (which is automatically calculated from recurring expenses).

### 2. Expenses & AI CFO (`/expenses`)
- **What it does:** Tracks what you are spending money on.
- **How to use it:** Click "+ Add Expense". When you submit a request (like "buying a MacBook"), our **Gemini AI CFO** will aggressively analyze it. It will give you a score from 1-10 and tell you to "Invest", "Maintain", or "Cut". 
- *Pro Tip:* The AI acts differently based on your context. If you are in "Genartml", it judges the expense based on whether it generates agency revenue. If you are in "Personal Brand", it judges based on audience growth.

### 3. Revenue & Clients (`/clients`)
- **What it does:** Tracks money coming in reliably. 
- **How to use it (Genartml):** Add your agency clients and their monthly retainers. It will calculate if your team size is profitable.
- **How to use it (Personal Brand):** Add income sources like YouTube AdSense, sponsorships, or consulting.
- The progress bar shows how close you are to breaking even against your monthly burn!

### 4. Ledger & Quick Add (`/ledger` & Shortcut)
- **What it does:** The chronological history of every single rupee moving in and out of your accounts.
- **How to use it:** You can add manually on the Ledger page, OR press the **"A" key** anywhere in the app to open the **Quick Add Bar**. Use this for rapid logging of ad-hoc expenses (like an Uber ride) or sudden income.

---

## 🛠️ Simplification & Future Changes

Flowled is designed to be highly modular. If you ever want to simplify features, I can easily change them for you. Here is what we can tweak:

1. **AI Strictness:** Right now, the AI CFO is very aggressive. We can rewrite the prompt to make it more forgiving or focused on specific goals.
2. **Authentication:** Currently, there is no login screen because you are the only user. If you want to invite your team, we can add Google Sign-In and lock down the Firebase rules.
3. **Data Categories:** The categories (Software, Travel, Equipment) are hardcoded. We can make them customizable in a settings page.
4. **Receipt Uploads:** Right now, we only store text. If you want, we can enable Firebase Storage so you can upload photo receipts when you add an expense.

If you find any feature too complex, just tell me: *"Remove the AI analysis step"* or *"Simplify the Dashboard"*, and I will adjust the code instantly!
