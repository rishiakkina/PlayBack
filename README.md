# Playback - Virtual Watch Party Platform

A real-time collaborative platform for watching sports and movies together with friends and fans. Create virtual rooms, share your screen, and enjoy synchronized viewing experiences with built-in chat functionality.

## 🎯 Features

- **Virtual Watch Parties**: Create and join rooms to watch content together
- **Screen Sharing**: Share your screen with room participants in real-time
- **Real-time Chat**: Communicate with other users in the room
- **Room Management**: Create password-protected rooms for private sessions
- **Responsive Design**: Modern UI built with Next.js and Tailwind CSS
- **WebRTC Integration**: Peer-to-peer screen sharing capabilities

## 🏗️ Tech Stack

### Frontend (Client)
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons

### Backend (Server)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **TypeScript** - Type safety
- **CORS** - Cross-origin resource sharing

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playback
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

### Running the Application

1. **Start the server** (from the `server` directory)
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:8080`

2. **Start the client** (from the `client` directory)
   ```bash
   npm run dev
   ```
   The client will start on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

## 📖 Usage

### Creating a Room

1. Click the **"Create Room"** button on the homepage
2. Enter a room name and password
3. Share the room ID and password with friends
4. Click **"Create"** to start your watch party

### Joining a Room

1. Click the **"Join Room"** button on the homepage
2. Enter the room ID and password provided by the room creator
3. Click **"Join"** to enter the watch party

### Screen Sharing

1. Once in a room, click the **"Share Screen"** button
2. Select the screen or application you want to share
3. Your screen will be visible to all room participants
4. Click **"Stop Sharing"** to end screen sharing

### Chat

- Use the chat panel on the right side to communicate with room participants
- Messages are sent in real-time to all users in the room

## 🏗️ Project Structure

```
playback/
├── client/                 # Frontend application
│   ├── app/               # Next.js app directory
│   │   ├── page.tsx       # Homepage
│   │   └── room/[id]/     # Room pages
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── ChatCard.tsx  # Chat functionality
│   │   ├── CreateRoom.tsx # Room creation
│   │   └── JoinRoom.tsx  # Room joining
│   ├── lib/              # Utility functions
│   ├── providers/        # Context providers
│   └── public/           # Static assets
├── server/               # Backend application
│   └── src/
│       └── index.ts      # Server entry point
└── README.md
```

## 🔧 Development

### Available Scripts

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Server:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Build and start production server

### Environment Variables

The application currently uses default localhost URLs. For production deployment, you'll need to configure:

- Server CORS origins
- Client Socket.io server URL
- Environment-specific configurations



## 👨‍💻 Author

**Rishi Akkina**
- Portfolio: [Notion Portfolio](https://rishiakkina.notion.site/Portfolio-1ef7c5483f2e8011a749dde2d11ecea7)

## 🐛 Known Issues

- Screen sharing is currently limited to one-to-one connections
- Room persistence is in-memory only (rooms are lost on server restart)
- No user authentication system

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Persistent room storage
- [ ] Multiple screen sharing support
- [ ] Video/audio streaming capabilities
- [ ] Room recording functionality
- [ ] Mobile app support
- [ ] Integration with streaming platforms

---

**Enjoy your virtual watch parties! 🎬🏈** 