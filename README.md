# Laniakea Frontend

An Angular 18+ single-page application for exploring Physics-Informed Neural Network simulations.

## Features

- **Problem Selection**: Browse and select physics problems with rich metadata
- **Model Gallery**: Explore pre-trained models with metrics and details
- **Interactive Explorer**: Configure parameters with sliders and run predictions
- **Dynamic Visualizations**: 1D plots (Plotly) and 2D/3D fields (Three.js)
- **Responsive Design**: Desktop and mobile-friendly interface
- **Dark Theme**: Astrophysics-inspired dark UI with PrimeNG

## Tech Stack

- **Framework**: Angular 18+
- **UI Library**: PrimeNG 17, PrimeFlex
- **Visualization**: Plotly.js, Three.js
- **Math Rendering**: KaTeX
- **State Management**: Angular Signals
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:4200`.

### Build

```bash
# Production build
npm run build

# The output will be in dist/laniakea-frontend/browser
```

## Project Structure

```
src/
├── app/
│   ├── core/                 # Singleton services, guards, models
│   │   ├── services/         # API, Physics, Models, Inference services
│   │   ├── interceptors/     # HTTP interceptors
│   │   ├── guards/           # Route guards
│   │   └── models/           # TypeScript interfaces
│   │
│   ├── shared/               # Reusable components
│   │   ├── components/       # Parameter slider, equation display, etc.
│   │   ├── pipes/            # Scientific notation, etc.
│   │   └── directives/       # Custom directives
│   │
│   ├── features/             # Feature modules
│   │   ├── home/             # Landing page
│   │   ├── problem-selection/ # Physics problem browser
│   │   ├── model-gallery/    # Model explorer
│   │   ├── inference-explorer/ # Parameter configuration & predictions
│   │   └── visualization/    # Plotly & Three.js components
│   │
│   └── layouts/              # Page layouts
│       ├── main-layout/      # Header, footer, content
│       └── minimal-layout/   # Minimal wrapper
│
├── environments/             # Environment configs
├── styles/                   # Global SCSS
└── assets/                   # Static assets
```

## API Configuration

Configure the backend API URL in the environment files:

- Development: `src/environments/environment.ts`
- Production: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
};
```

## Deployment

### Vercel

The project includes a `vercel.json` configuration file for easy deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## License

MIT
