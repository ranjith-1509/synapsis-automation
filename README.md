# MOA-AI - Medical Document Processing System

A modern Electron-based desktop application for processing and managing medical documents with AI-powered smart sorting, classification, and analysis.

## 🚀 Features

- **AI Smart Sorter** - Automated document classification and routing
- **Document Processing** - Process medical referrals and administrative documents
- **Real-time System Monitoring** - Live GPU, CPU, and Network activity tracking
- **Audit Logs** - Comprehensive activity logging and tracking
- **Responsive UI** - Modern, collapsible sidebar with dynamic content
- **Offline Mode** - Works without internet connection
- **PDF Management** - View, upload, and manage PDF documents

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **Git** (for cloning the repository)

### Check your versions:
```bash
node --version
npm --version
```

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd moa-ai
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required dependencies including:
- React
- Ant Design
- Electron
- Lottie React
- React Router DOM
- Tailwind CSS

## 🏃 Running the Application

### Development Mode

#### Option 1: Run React and Electron Separately (Optional)

**Terminal 1 - Start React Development Server:**
```bash
npm start
```
Wait for the React app to start (usually at http://localhost:3000)

**Terminal 2 - Start Electron App:**
```bash
npm run electron
```

#### Option 2: Run Both Concurrently
```bash
npm run electron:dev
```

The application will open in an Electron window with hot-reload enabled for development.

### Production Build

#### Build for Windows (.exe)
```bash
npm run build:win
```

The executable will be created in the `dist/` folder:
- `dist/MOA-AI Setup 1.0.0.exe` - Installer
- `dist/win-unpacked/` - Unpacked application

#### Build React App Only
```bash
npm run build
```

## 🗂️ Project Structure

```
moa-ai/
├── public/                  # Public assets
│   ├── index.html
│   └── ...
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard/
│   │   ├── Sidebar/
│   │   ├── SystemStatus/
│   │   ├── Modals/
│   │   └── icons/
│   ├── pages/              # Page components
│   │   ├── NewWorkFlow.js
│   │   ├── DocumentProcess.js
│   │   ├── AdminDocument.js
│   │   ├── MedicalDocument.js
│   │   └── AuditLogs.js
│   ├── JSON/               # Data files
│   │   └── dataSource.json
│   ├── images/             # Images and animations
│   ├── App.js              # Main App component
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── electron/
│   ├── main.js             # Electron main process
│   └── preload.js          # Preload scripts
├── package.json
├── tailwind.config.js
└── README.md
```

## 🔑 Key Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start React development server |
| `npm run electron` | Start Electron app |
| `npm run electron:dev` | Run React and Electron concurrently |
| `npm run build` | Build React app for production |
| `npm run build:win` | Build Windows executable |
| `npm test` | Run tests |

## 🎨 Features Overview

### 1. Login Screen
- Secure authentication
- Session management
- Token-based access

### 2. Dashboard (AI Smart Sorter)
- Upload and process documents
- Real-time processing feedback
- Lottie animations for loading states
- View and manage processed documents

### 3. Document Processing Pages
- **New Work Flow** - Create and manage workflows
- **AI Document Process** - Automated document classification
- **Admin Document** - Administrative document management
- **Medical Document** - Medical records processing

### 4. System Monitoring
Located in the sidebar's Network Activity section:
- **GPU Usage** - Real-time GPU load (0-100%)
- **CPU Usage** - Real-time CPU load (0-100%)
- **Network Status** - Online/Offline with speed indicator

### 5. Audit Logs
- Comprehensive activity tracking
- User action logs
- System event logs
- Timestamp-based records

## ⚙️ Configuration

### Electron Configuration
Edit `electron/main.js` to customize:
- Window size and position
- Background throttling settings
- Dev tools access

### Backend API
Update API endpoints in:
- `src/components/Dashboard/Dashboard.js`
- Current endpoint: `http://127.0.0.1:8000/process-folder/`

### Styling
- **Tailwind CSS**: `tailwind.config.js`
- **Ant Design**: Theme customization in `src/App.js`
- **Custom CSS**: Component-specific `.css` files

## 🐛 Troubleshooting

### Issue: Electron app won't open
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run electron:dev
```

### Issue: Build fails with "description is missed"
**Solution:** Already fixed in `package.json` with proper description field.

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
set PORT=3001 && npm start
```

### Issue: ERR_CONNECTION_REFUSED
**Solution:** Ensure React dev server is running before starting Electron.

## 📦 Building for Distribution

### Windows
```bash
npm run build:win
```

### Requirements for Building:
- Windows Developer Mode enabled (for symlinks)
- Administrator privileges (recommended)

### Output:
- `dist/MOA-AI Setup 1.0.0.exe` - Installer
- Packaged with all dependencies
- No Node.js required on target machine

## 🔒 Security Notes

- Sensitive data handling in compliance with medical privacy standards
- Local storage encryption for tokens
- Secure IPC communication between Electron processes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Support

For support and questions:
- Contact: [Your Contact Information]
- Documentation: [Your Docs URL]

## 🎯 Roadmap

- [ ] Cloud sync integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile companion app
- [ ] Enhanced AI models

## 🙏 Acknowledgments

- Ant Design Team
- Electron Community
- React Team
- All contributors

---

**Built with ❤️ for efficient medical document processing**
