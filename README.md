# 🎮 Kids Passion Analyzer

🌐 **Live Application:**  
https://kids-passion-analyser-one.vercel.app/

Kids Passion Analyzer is an AI-enhanced educational web platform designed to help children discover and develop their interests through interactive gameplay.

The platform combines creativity-driven mini-games with behavioral analysis and parental monitoring tools to create a safe, engaging, and insight-driven learning environment.

---

## 🧠 Project Vision

Children often discover their passions through play rather than direct instruction.

This platform:

- Encourages exploration through games  
- Observes interaction patterns  
- Tracks creativity and logical thinking  
- Lays the foundation for AI-based passion analysis  

Rather than labeling children, the system gathers behavioral signals to better understand their natural preferences.

---

## 🎮 Available Games

Each mini-game includes independent scoring, timing, and interaction tracking.

- 🍳 **CookingGame** – Sequence recipes correctly (logic & order recognition)  
- 🎨 **DrawingGame** – Free drawing, coloring, and creative mode with stroke analysis  
- 🏗️ **BuildingGame** – Arrange blocks structurally  
- 👗 **FashionGame** – Outfit matching and visual coordination  
- 🌲 **ForestGame** – Exploration and item collection  
- 🎵 **MusicGame** – Rhythm and melody recognition  
- ⚽ **SportsGame** – Simple sports-based challenges  
- 🔤 **WordLearningGame** – Letter and spelling recognition  

Games are accessed through the `GameSelector` after parent authentication.

---

## 🎨 Intelligent Drawing System (Enhanced Feature)

The DrawingGame includes behavioral analysis logic.

It analyzes:

- Stroke tracking  
- Direction smoothness  
- Angle variation  
- Closed-loop detection  
- Canvas area coverage  
- Structural consistency  

### 🧠 Drawing Classification

The system differentiates between:

- Scribbling (random motor movement)  
- Basic Drawing (structured but simple)  
- Detailed Drawing (intentional, planned shapes)  

This forms the foundation for future AI-driven creativity scoring.

---

## 🛡️ Parent Features

### 🔐 Parent Authentication
Secure parent login via Firebase.

### 📊 Parent Dashboard
- Monitor game performance  
- Review scores  
- Select accessible games  
- Manage child sessions  

### 🤖 Chat Assistant
Integrated chatbot for:
- Navigation help  
- Game hints  
- Platform guidance  

---

## ✨ Core Platform Features

- 🎯 Fully responsive UI (desktop & mobile)  
- 🧩 Modular component architecture  
- 🔔 Toast notifications for real-time feedback  
- 🛠️ Global state management via `GameContext`  
- 📱 Responsive behavior with `use-mobile` hook  
- 🎨 Canvas-based drawing engine with advanced stroke tracking  
- 🔥 Firebase backend integration  
- ☁️ Deployed on Vercel  

---

## 🏗️ Architecture Overview

### Frontend
- React + TypeScript  
- Vite  
- shadcn/ui components  
- lucide-react icons  

### Backend & Services
- Firebase Authentication  
- Firebase Firestore  
- Firebase Storage  
- Gemini API (chat assistant)  

### Drawing Engine
- HTML5 Canvas API  
- Custom stroke tracking  
- Behavioral rule-based analysis engine  

---

## 📦 Tech Stack

- React  
- TypeScript  
- Vite  
- Firebase  
- shadcn/ui  
- lucide-react  
- Canvas API  
- Vercel (Deployment)  

---

## 🚀 Getting Started

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd kids_passion_Analyser
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```ini
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini API 
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

⚠️ Ensure Firebase is properly configured in `lib/firebase.ts`.

---

## 🌍 Deployment

Hosted on **Vercel**:

https://kids-passion-analyser-one.vercel.app/

---

## 🔮 Roadmap

- 📊 Persistent user profiles & progress tracking  
- 🤖 Machine Learning-based drawing classification  
- 🧬 Passion profile scoring engine  
- 📈 Parent analytics dashboard  
- 🌍 Internationalization support  
- ♿ Accessibility improvements  
- 📱 Mobile-first enhancement  
- 🎓 Research-grade behavioral modeling  

---

## 💡 Why This Project Matters

Kids Passion Analyzer moves beyond traditional educational apps.

It aims to:

- Understand behavior through interaction  
- Encourage creativity without restriction  
- Provide parents with insight, not labels  
- Build a scalable AI-driven passion discovery system  

This project represents the first step toward an intelligent adaptive learning ecosystem.


---

⭐ If you found this project interesting, consider giving it a star!
