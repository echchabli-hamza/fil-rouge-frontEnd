# 🎬 MovieTalk Frontend - CINÉMA

A modern, cinematic movie platform frontend built with **Angular 17**, featuring public list discovery, movie recommendations, and a dark/light theme system.

![Angular](https://img.shields.io/badge/Angular-17+-red?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue?style=flat-square&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

- 🎥 **Movie Discovery** - Browse, search, and filter movies by category
- 📚 **Public Lists** - Discover and explore movie lists created by other users
- 🎬 **Movie Details** - View comprehensive movie information, ratings, and reviews
- 🌙 **Dark/Light Theme** - Beautiful cinematic dark theme with elegant light mode alternative
- 👤 **User Profiles** - Manage preferences and create personal movie lists
- 🔐 **Authentication** - Secure login and registration system
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- ⚡ **Performance** - Optimized bundle sizes and lazy-loaded components

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Angular CLI** 17+ (optional but recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/hamza/FRouge.git
cd MTfrontEnd
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
# or
ng serve
```

4. **Open in browser**
Navigate to `http://localhost:4200/`

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/           # API & business logic services
│   │   ├── models/             # TypeScript interfaces
│   │   ├── interceptors/       # HTTP interceptors (JWT, etc)
│   │   └── guards/             # Route guards (auth, admin, etc)
│   ├── features/               # Feature modules
│   │   ├── landing/            # Home page
│   │   ├── auth/               # Login & registration
│   │   ├── search/             # Movie search
│   │   ├── movie-detail/       # Movie details page
│   │   ├── profile/            # User profile
│   │   ├── user-lists/         # Public lists discovery
│   │   ├── dashboard/          # User dashboard
│   │   ├── admin/              # Admin panel
│   │   └── settings/           # User settings
│   ├── shared/                 # Shared components & utilities
│   │   ├── layout/             # Navbar, footer
│   │   ├── components/         # Reusable components (modals, cards, etc)
│   │   └── pipes/              # Custom pipes
│   ├── app.routes.ts           # Route configuration
│   ├── app.config.ts           # App initialization config
│   └── app.ts                  # App component
├── environments/               # Environment configs
├── index.html                  # HTML entry point
├── main.ts                     # Bootstrap file
└── styles.css                  # Global styles
```

## 📦 Build

### Development Build
```bash
npm run build
# Output: dist/MTfrontEnd
```

### Production Build
```bash
ng build --configuration production
# Optimized, minified output with smaller bundle sizes
```

## 🐳 Docker

### Build Docker Image
```bash
docker build -t mtfrontend:latest .
```

### Run Docker Container
```bash
docker run -d -p 80:80 --name mtfrontend mtfrontend:latest
```

Access at `http://localhost`

### Docker Compose (Frontend + Backend + Database)
```bash
docker-compose up -d
```

## 🔌 API Integration

The frontend communicates with the Spring Boot backend at:
- **Development**: `http://localhost:8080`
- **Production**: Configure in `src/environments/environment.ts`

### Key API Endpoints

```
GET  /movies                    # Get all movies
GET  /movies/{id}               # Get movie details
GET  /user/lists                # Get all public lists
GET  /user/lists/{id}/movies    # Get movies in a list
POST /auth/login                # User login
POST /auth/register             # User registration
```

## 🎨 Theming

The application includes a sophisticated dark/light theme system:

- **Dark Mode** (Default): Cinematic black with gold accents
- **Light Mode**: Warm cream/beige with elegant brown text

Themes automatically respect OS system preference using `prefers-color-scheme` media query.

### Theme Colors

```css
--cinema-black: #0a0a0a          /* Dark background */
--cinema-gold: #c9a227            /* Primary accent */
--cinema-red: #8b0000             /* Error/action color */
--cinema-cream: #e8e4dc           /* Light text */
```

## 🧪 Testing

Run unit tests:
```bash
npm test
```

Run with coverage:
```bash
ng test --code-coverage
```

## 📝 Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server on localhost:4200 |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `ng lint` | Run linter (if configured) |
| `ng e2e` | Run end-to-end tests (if configured) |

## 🔐 Authentication

Login credentials stored in localStorage with JWT tokens. Protected routes require valid authentication.

- Login page: `/login`
- Register page: `/register`
- Protected routes use `AuthGuard` and `JwtInterceptor`

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components are fully responsive and tested across devices.

## 🚀 Performance Optimizations

- ✅ Lazy loading of feature modules
- ✅ OnPush change detection strategy
- ✅ Tree-shaking enabled in production
- ✅ Gzip compression via nginx
- ✅ Long-term caching for versioned assets
- ✅ Optimized bundle sizes (< 400KB gzipped)

## 🐛 Troubleshooting

### Port 4200 already in use
```bash
ng serve --port 4300
```

### Dependencies issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
npm run build --verbose
```

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Hamza** - [GitHub](https://github.com/hamza)

## 🎯 Roadmap

- [ ] Advanced filtering and sorting
- [ ] User notifications system
- [ ] Social sharing features
- [ ] Recommendation engine
- [ ] Offline support with PWA
- [ ] Mobile app (React Native)

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for cinema lovers** 🎬
