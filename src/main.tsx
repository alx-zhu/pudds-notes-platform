import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { runMigration001 } from './migrations/001-cost-per-lb-to-cost'

// Run data migrations before the app mounts. Each migration is idempotent
// and exits immediately after the first successful run (flag stored in
// localStorage). Delete the import + call once all clients are past this
// version.
runMigration001();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
