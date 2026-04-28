# Flowled - Smart Founder Finance Cockpit

A dual-entity finance cockpit for founders tracking both business and personal brand metrics. Includes AI-powered expense analysis and a complete money movement ledger.

## Tech Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Firebase (Client SDK + Admin SDK)
- Google Gemini (gemini-1.5-flash)

## Setup Instructions

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Firebase Setup**
   - Create a project on [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database (Start in test mode or configure security rules)
   - Enable Anonymous Authentication
   - Go to Project Settings > General > Add Web App to get Client Config
   - Go to Project Settings > Service Accounts > Generate new private key to get Admin Config

3. **Gemini Setup**
   - Get an API key from [Google AI Studio](https://aistudio.google.com/)

4. **Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in all the keys from Firebase and Gemini. Note: The `FIREBASE_ADMIN_PRIVATE_KEY` must preserve `\n` characters (as provided in the JSON file).

5. **Run Locally**
   \`\`\`bash
   npm run dev
   \`\`\`
   The app will be available at http://localhost:3000

## Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Copy all variables from `.env.local` into Vercel's Environment Variables settings
4. Deploy
