# STEVE Frontend - Simple

A modern React frontend for STEVE (Strategic Ticket Evaluation & Vision Enforcer).

## Features

- 🎯 **Strategic Dashboard**: Real-time visualization of ticket alignment
- 📊 **Interactive Charts**: Pie charts and bar charts with hover tooltips
- 🎨 **Modern Design**: Glass morphism, gradients, and smooth animations
- 🌙 **Dark/Light Mode**: Complete theme switching with system preference detection
- 🏷️ **Color-Coded Scores**: Instant visual feedback for alignment scores
- ⚙️ **Agent Configuration**: Customize AI agent instructions
- 📱 **Responsive**: Works on desktop, tablet, and mobile
- ♿ **Accessible**: Keyboard navigation and screen reader support

## Quick Start

```bash
# Run the complete STEVE system
./run-steve-simple.sh

# Or run frontend only
cd steve-frontend-simple
npm install
npm run dev
```

## Score Color System

- 🟢 **High (80-100)**: Green - Core value alignment
- 🔵 **Medium (60-79)**: Blue - Strategic enabler
- 🟡 **Low (40-59)**: Amber - Drift requiring attention
- 🔴 **Critical (0-39)**: Red - Distraction from strategy

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Modern CSS with custom properties
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React for consistent iconography

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

The frontend connects to the STEVE backend API running on `http://localhost:8000`.

### Endpoints

- `POST /analyze` - Start ticket analysis
- `GET /analysis/{id}` - Get analysis result
- `GET /analysis` - Get latest analysis

## Customization

### Themes

Edit CSS custom properties in `src/App.modern.css`:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #0f172a;
  /* ... */
}
```

### Score Thresholds

Modify score ranges in `src/App.tsx`:

```typescript
const getScoreTier = (score: number) => {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  return 'critical';
};
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Part of the STEVE project - Strategic Ticket Evaluation & Vision Enforcer