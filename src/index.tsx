console.log('🔷 index.tsx loading...');
import './index.css';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import { App } from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
// import { AppProvider } from "./context/AppContext"; // TODO: Enable after component migration

console.log('🔷 Looking for root element...');
const container = document.getElementById("root");
if (!container) {
  console.error('❌ Root element not found!');
  throw new Error("Root element not found");
}
console.log('✅ Root element found:', container);

console.log('🔷 Creating React root...');
const root = createRoot(container);
console.log('🔷 Rendering app...');
root.render(
  <ErrorBoundary>
    <BrowserRouter>
      {/* TODO: Wrap in AppProvider after migrating components */}
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);
console.log('✅ Render complete!');