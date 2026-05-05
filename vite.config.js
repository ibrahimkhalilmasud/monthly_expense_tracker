import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use VITE_BASE_URL env var so each deployment target can set its own base.
  // GitHub Pages needs '/monthly_expense_tracker/', Azure SWA needs '/'.
  base: process.env.VITE_BASE_URL || '/monthly_expense_tracker/',
})
