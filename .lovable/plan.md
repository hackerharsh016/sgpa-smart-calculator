

# SGPA Calculator - AI-Powered Grade Analysis

## Overview
A modern, colorful SGPA calculator that uses AI-powered OCR (Gemini 2.5 Flash) to extract grade data from uploaded screenshots/images and automatically calculates your semester GPA.

---

## Core Features

### 1. Smart Image Upload & OCR
- **Drag & drop** or click-to-upload interface for grade screenshots
- **AI-powered OCR** using Gemini 2.5 Flash to extract table data
- Automatic detection of: Course Code, Course Name, Credits, Grade Points, and Grades
- Real-time extraction progress indicator
- Preview of uploaded image with extracted data overlay

### 2. SGPA Calculation Engine
- **10-point grading scale** (O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0)
- Formula: SGPA = Σ(Credits × Grade Points) / Total Credits
- Instant calculation as data is extracted
- Visual breakdown showing each course's contribution to SGPA
- Editable extracted data for corrections

### 3. Grade Prediction Tool
- Set a target SGPA goal
- Calculator shows what grades you need in remaining/hypothetical courses
- "What if" scenarios - adjust grades and see impact on SGPA
- Helpful for academic planning

### 4. Export & Save Results
- **PDF Export** - Formatted grade report with SGPA
- **Share Link** - Generate shareable link with results
- Local storage for past calculations

---

## User Interface Design

### Modern & Colorful Theme
- Vibrant gradient backgrounds (purple to blue tones)
- Glowing cards with subtle animations
- Smooth transitions and hover effects
- Responsive design for mobile and desktop
- Dark mode support

### Main Sections
1. **Hero Section** - App title, quick upload area
2. **Upload Zone** - Large drag-drop area with visual feedback
3. **Results Dashboard** - Extracted data table + SGPA display
4. **Grade Predictor** - Interactive planning tool
5. **Export Panel** - Download and share options

---

## Technical Architecture

### Frontend Components
- Image uploader with drag-drop support
- Editable data table for grade information
- Animated SGPA gauge/display
- Grade predictor with sliders
- PDF generation for exports

### Backend (Supabase Edge Function)
- Secure Gemini API integration (API key stored as secret)
- Image processing and OCR extraction
- Structured data parsing from AI response

---

## User Flow

1. **Land on page** → See colorful hero with clear CTA
2. **Upload screenshot** → Drag/drop or click to upload grade image
3. **AI processes** → See loading animation while OCR extracts data
4. **Review data** → Verify extracted courses, credits, grades in editable table
5. **View SGPA** → Large, animated display of calculated SGPA
6. **Predict grades** → Use predictor to plan for target SGPA
7. **Export results** → Download PDF or copy shareable link

