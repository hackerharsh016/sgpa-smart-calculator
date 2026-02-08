# 🎓 SGPA Smart Calculator

> **AI-Powered Grade Extraction & Prediction Tool** > *Designed and Developed by Harsh Potdar*

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Vite-blue)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)

## 📖 Problem Statement
Calculating SGPA (Semester Grade Point Average) often involves tedious manual data entry of course codes, credits, and grades from result sheets. Students frequently make calculation errors or struggle to estimate how future grades will impact their overall performance. 

**SGPA Smart Calculator** solves this by automating the data entry process. It uses AI to "read" your grade sheet screenshots, instantly calculates your SGPA, and provides a "Grade Predictor" to help you plan your academic targets.

## ✨ Key Features

* **📸 AI-Powered OCR:** Upload a screenshot of your result/grade sheet, and the system uses Google's Gemini 1.5 Flash model to automatically extract course names, credits, and grades.
* **🧮 Instant Calculation:** Automatically computes SGPA using the standard formula: $\frac{\sum (Credits \times Grade Points)}{\text{Total Credits}}$.
* **🔮 Grade Predictor:** Set a "Target SGPA" (e.g., 9.0) and add hypothetical future courses to see exactly what grades you need to achieve your goal.
* **✏️ Editable Data:** Full control to manually add, edit, or delete courses if the AI misses anything.
* **📊 Visual Insights:** View your performance breakdown with interactive charts and grade distribution visualizations.
* **📱 Responsive Design:** Fully optimized for mobile and desktop devices.
* **🔒 Client-Side Privacy:** No backend server required. All image processing happens directly via the browser using secure API calls.

## 🛠️ System Architecture

This project is built as a **Client-Side Single Page Application (SPA)**. It has been architected to be lightweight and serverless.

### Tech Stack
* **Frontend Framework:** React 18 (with TypeScript)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **UI Components:** Shadcn UI (Radix Primitives)
* **Icons:** Lucide React
* **AI Engine:** Google Gemini API (Accessed directly via client-side hooks)

### Data Flow
1.  **User Upload:** User selects an image file.
2.  **Preprocessing:** Image is converted to Base64 in the browser.
3.  **AI Extraction:** The `useGradeExtraction` hook sends the image to Google's Gemini API with a specific prompt to identify grade tables.
4.  **Resiliency:** The system implements a **Round-Robin API Key Rotation** strategy. If one API key hits a rate limit (429), it automatically switches to a backup key to ensure uninterrupted service.
5.  **Visualization:** Extracted data is stored in React state and passed to the `GradeTable`, `SGPADisplay`, and `GradePredictor` components.

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
* Node.js (v16 or higher)
* npm or bun

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/sgpa-smart-calculator.git](https://github.com/your-username/sgpa-smart-calculator.git)
    cd sgpa-smart-calculator
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    bun install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:8080` (or the port shown in your terminal).

## 📂 Project Structure

```bash
src/
├── components/         # UI Components
│   ├── ui/             # Reusable Shadcn UI elements (Buttons, Inputs, etc.)
│   ├── GradePredictor.tsx  # Logic for future grade prediction
│   ├── GradeTable.tsx      # Editable table for course data
│   ├── ImageUploader.tsx   # Drag & drop file upload component
│   └── SGPADisplay.tsx     # Visual score gauge and summary
├── hooks/
│   └── useGradeExtraction.ts # Core AI logic & API key rotation
├── types/
│   └── grades.ts       # TypeScript interfaces for GradeData & logic
├── pages/
│   └── Index.tsx       # Main landing page
└── lib/                # Utility functions

##🤝 Contributing
Contributions are welcome! If you'd like to improve the grade extraction prompt or add support for PDF uploads:

**Fork the repository.**

**Create a feature branch (git checkout -b feature/AmazingFeature).**

**Commit your changes (git commit -m 'Add some AmazingFeature').**

**Push to the branch (git push origin feature/AmazingFeature).**

**Open a Pull Request.**

##📝 License
Distributed under the MIT License. See LICENSE for more information.

##👨‍💻 Author
Harsh Potdar

LinkedIn: Harsh Potdar

Instagram: @harsh_potdar23

Email: harshpotdar023@gmail.com
