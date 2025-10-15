# Mentorship Platform

A modern, full-featured mentorship platform connecting mentors and mentees through video calls, messaging, and session booking.

## 🚀 Features

### For Mentees
- Browse and search mentors by category and expertise
- Book mentorship sessions with available mentors
- Real-time video calling with WebRTC
- Instant messaging with mentors
- Personal dashboard to track sessions
- Profile management

### For Mentors
- Create and manage mentor profile
- Set availability and rates
- Accept/manage booking requests
- Conduct video call sessions
- Chat with mentees
- Dashboard to track sessions and earnings

### Core Features
- **Authentication**: Secure user authentication with Supabase
- **Real-time Video Calls**: WebRTC-powered video calling with TURN/STUN servers
- **Messaging System**: Real-time chat between mentors and mentees
- **Booking System**: Schedule and manage mentorship sessions
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark Mode Support**: Toggle between light and dark themes

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (Database, Auth, Real-time, Storage)
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Video Calling**: WebRTC with native browser APIs
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- A Supabase account (for backend services)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

The project is pre-configured with Supabase environment variables in the `.env` file:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=your_supabase_url
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Footer component
│   └── ...
├── pages/              # Page components (routes)
│   ├── Index.tsx       # Home page
│   ├── AuthPage.tsx    # Login/Signup
│   ├── MentorDashboard.tsx
│   ├── MenteeDashboard.tsx
│   ├── CallPage.tsx    # Video call interface
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useWebRTC.ts    # WebRTC video call logic
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
└── App.tsx             # Main app component with routing
```

## 🎨 Design System

The project uses a comprehensive design system with:
- Semantic color tokens (defined in `src/index.css`)
- Tailwind CSS configuration (`tailwind.config.ts`)
- shadcn/ui components for consistent UI
- Dark mode support via `next-themes`

## 🔐 Authentication

Authentication is handled by Supabase Auth with support for:
- Email/Password authentication
- Protected routes (mentor and mentee dashboards)
- Role-based access (mentor vs mentee)

## 📞 Video Calling

The video calling system uses:
- WebRTC for peer-to-peer connections
- Supabase Realtime for signaling
- TURN servers for NAT traversal
- Automatic reconnection on connection loss

## 🗄️ Database

Database schema includes:
- `profiles` - User profile information
- `mentor_profiles` - Mentor-specific data
- `bookings` - Session booking records
- `call_sessions` - Video call session tracking
- `messages` - Chat messages

## 🚀 Deployment

### Deploy with Lovable

1. Visit [Lovable](https://lovable.dev/projects/be48ce83-82ee-43ec-ae69-ba481aa3dab2)
2. Click Share → Publish
3. Your app will be deployed automatically

### Deploy Elsewhere

The app can be deployed to any static hosting service:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

Build the production bundle:

```bash
npm run build
```

The `dist/` folder contains the production-ready files.

## 🔗 Custom Domain

To connect a custom domain:
1. Navigate to Project > Settings > Domains in Lovable
2. Click Connect Domain
3. Follow the DNS configuration instructions

Note: A paid Lovable plan is required for custom domains.

## 🤝 Contributing

This project is built with Lovable. You can:
- Edit directly in [Lovable](https://lovable.dev/projects/be48ce83-82ee-43ec-ae69-ba481aa3dab2)
- Clone and edit locally, then push to GitHub
- Use GitHub Codespaces

Changes made in Lovable are automatically committed to the repository.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Video call not connecting
- Check browser permissions for camera/microphone
- Ensure TURN servers are configured correctly
- Check network firewall settings

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

## 📚 Learn More

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

This project is built with Lovable and uses open-source technologies.

## 🔗 Links

- **Project URL**: https://lovable.dev/projects/be48ce83-82ee-43ec-ae69-ba481aa3dab2
- **Discord Community**: [Join Lovable Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
