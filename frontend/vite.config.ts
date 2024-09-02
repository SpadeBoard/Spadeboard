import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      port: parseInt(process.env.VITE_FRONTEND_PORT || '3000'), // Default to '5173' if undefined
      strictPort: true,
      host: true,
    },
  };
});