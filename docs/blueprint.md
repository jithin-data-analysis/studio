# **App Name**: CampusAI

## Core Features:

- Admin Configuration: Admin configuration page with multi-tab UI for managing classes, sections, students, subjects, and co-curricular activities.
- Teacher Dashboard: Teacher dashboard for uploading assessments, entering marks, and viewing performance insights.
- AI Insights: AI-powered insights to provide per-student trends, weakness flags, personalized tips, and predictive outcomes using Gemini as a tool.

## Style Guidelines:

- Primary color: Indigo (#663ab5) for a professional and trustworthy feel.
- Secondary color: Light gray (#f0f0f0) for backgrounds and neutral elements.
- Accent: Teal (#008080) for interactive elements and highlights.
- Clean and modern fonts for readability across all devices.
- Consistent and professional icon set for easy navigation.
- Clean and intuitive layout with clear information hierarchy.

## Original User Request:
🏗️ Full Project Blueprint: AI-Powered School Progress Platform
🔐 1. Admin Configuration Page (UI-Driven)
🎯 Purpose
Allow admin to define school structure — classes, sections, students, subjects, and co-curriculars.

🖼️ UI Design
Layout: Multi-tab UI (or collapsible sidebar menu)
Tabs:

Classes & Sections

Students

Subjects

Co-Curricular Activities

1.1 Classes & Sections

UI Element	Description
🎛️ Dropdown	"Add Class (Grade 1 to Grade 12)"
➕ Section Add Button	Auto-names A, B, C, etc.
🧾 Class Cards	Each class → Section cards inside
🧑‍🎓 Section View	Visual grid like movie ticket booking layout with student “slots”
1.2 Student Slot Modal
Name, Roll No., DOB, Gender, Optional Photo

Assign Co-curriculars via checkboxes

1.3 Subjects Tab

UI Element	Description
➕ Add Subject	Per class
📤 Upload Syllabus	PDF/DOC, saved per subject
📎 File Link	Download or preview syllabus
1.4 Co-Curricular Tab

UI Element	Description
🏷️ Add Activities	“Sports”, “Music”, “Theatre”...
📋 Assign to Student	Checkboxes in student modal
🧱 Technologies
Frontend: React + Tailwind + shadcn/ui

Backend: Supabase (auth, database, file storage)

Routing/Pages: Next.js or Vite

👩‍🏫 2. Teacher Dashboard
🎯 Purpose
Upload assessments, enter marks, receive insights per student/class via AI agents.

🖼️ UI Design
Tabs:

Upload Test Paper

Enter Marks

Performance Insights

Class Reports

2.1 Upload Test Paper

Element	Description
📤 Upload	PDF/DOC
🧠 Gemini Agent Output	Show: Summary, Bloom’s Level, Total Marks, Extracted MCQs
✨ Agent Trigger:
On file upload → Send to Gemini LLM via n8n

Output returned and rendered in UI

Prompt Example for Gemini:

text
Copy
Edit
You are an educational document analyzer. Read the uploaded question paper and return:
- Summary of subjects and concepts
- Bloom’s taxonomy level (e.g., Knowledge, Comprehension, Application…)
- Total marks detected
- If possible, extract MCQ-style questions into structured JSON.
2.2 Enter Student Marks

Element	Description
📋 Class/Section Picker	
📅 Test Metadata Form	Subject, Date, Type
🧾 Table Entry	Name, Marks
📤 CSV Upload Option	
2.3 Insights & Suggestions

Feature	Description
📊 Per-Student Trends	“Aryan improved 12% in Science this term.”
🧠 Weakness Flags	“Geometry was poorly scored by 70% of 8B.”
💡 Personalized Tips	“Focus on word problems with Riya.”
🔁 Predictive Outcomes	“Rohit is likely to underperform in Math next month.”
✨ Agent Trigger:
After marks submission → Send full mark data + test metadata to Gemini LLM (via n8n) with historical context.

2.4 Class Reports
Charts:

Class average by subject/test

Section A vs B comparisons

High/low scorers

Filters:

Test type, subject, date range

2.5 Co-Curricular Correlation

Output	Description
⚖️ Balance Check	“Students in sports do better in teamwork-based tests.”
📉 Risk Flags	“Students in 3+ activities have lower math scores.”
💬 Suggestions	“Encourage Riya to reduce activities during exam week.”
✨ Agent Trigger:
Batch process every term using Gemini agent + data query from Supabase.

🤖 Agent Design via n8n
Each task has an n8n workflow triggered on:

File upload

Marks upload

Report generation

✳️ Agent Nodes
HTTP Node (Gemini via OpenRouter)

Supabase Query Nodes (Fetch context)

Prompt Construction Node (Template + inputs)

Response Formatter

Update UI via webhook or DB flag

🗃️ Data Models (Supabase)
Students
id, name, dob, gender, photo, classId, sectionId, coCurriculars (array)

Classes & Sections
id, name, grade, maxStudents

Subjects
id, name, classId, syllabusFileUrl

Tests
id, classId, subjectId, teacherId, date, type, totalMarks

Marks
id, studentId, testId, obtainedMarks

🛠️ Deployment & Scalability

Stack	Description
Supabase	Backend (DB, Auth, Storage, API)
React + Next.js	Frontend (SPA with SSR)
n8n	AI agent orchestrator (hosted or self-deployed)
Gemini LLM	GenAI backend via OpenRouter or Google AI
Vercel	Deploy frontend (or Netlify/Firebase Hosting)
  