# HALS Platform

Welcome to the HALS Platform! This project is a modern web application built with a robust technology stack to integrate AI-driven functionalities and seamless user experiences.

## 🚀 Technologies Used

- **Frontend Framework**: React 18, Vite
- **Styling**: Tailwind CSS, Framer Motion for animations
- **Backend & Database**: Supabase, PostgreSQL
- **AI Integrations**: Google Generative AI, Groq SDK
- **Utilities**: React Router, React Markdown, Mermaid, jsPDF, Canvas Confetti

## 🛠️ Getting Started

### Prerequisites

- Node.js (version 18 or above recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd hals
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   - Copy or rename `.env.example` to `.env` (if provided).
   - Fill in your Supabase variables, Google AI API keys, and Groq API keys as required.

### Development

Run the local development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Build

To create a production build:
```bash
npm run build
# or
yarn build
```

The optimized assets will be generated in the `dist` folder.

## 📜 Database Setup

Check the `SETUP_DATABASE.md` file or the `supabase-schema.sql` for instructions on setting up your Supabase PostgreSQL database tables and schemas.

## 📄 License

[Specify your license here, e.g., MIT, Proprietary, etc.]
