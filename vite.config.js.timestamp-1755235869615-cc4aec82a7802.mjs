// vite.config.js
import { defineConfig } from "file:///C:/Users/Saddam%20A.%20Usman/Desktop/grading/project/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Saddam%20A.%20Usman/Desktop/grading/project/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    },
    hmr: {
      // Reduce HMR logging
      clientPort: 443,
      overlay: false,
      // Only show errors in overlay
      overlayWarnings: false
    }
  },
  // Custom logger to filter out HMR messages
  customLogger: {
    ...console,
    info: (msg, options) => {
      if (msg.includes("[vite] hmr update")) return;
      if (msg.includes("hmr:update") || msg.includes("hot updated")) return;
      console.log(msg, options);
    },
    warn: (msg, options) => {
      if (msg.includes("Sourcemap for") && msg.includes("points to missing source files")) return;
      console.warn(msg, options);
    }
  },
  // Clear the screen on restart
  clearScreen: false,
  // Log level
  logLevel: "warn",
  // Disable source maps in development for better performance
  // You can re-enable if needed for debugging
  build: {
    sourcemap: mode === "development" ? false : "hidden"
  },
  // Disable CSS source maps for better performance
  css: {
    devSourcemap: false
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxTYWRkYW0gQS4gVXNtYW5cXFxcRGVza3RvcFxcXFxncmFkaW5nXFxcXHByb2plY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFNhZGRhbSBBLiBVc21hblxcXFxEZXNrdG9wXFxcXGdyYWRpbmdcXFxccHJvamVjdFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvU2FkZGFtJTIwQS4lMjBVc21hbi9EZXNrdG9wL2dyYWRpbmcvcHJvamVjdC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gICAgaG1yOiB7XG4gICAgICAvLyBSZWR1Y2UgSE1SIGxvZ2dpbmdcbiAgICAgIGNsaWVudFBvcnQ6IDQ0MyxcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgICAgLy8gT25seSBzaG93IGVycm9ycyBpbiBvdmVybGF5XG4gICAgICBvdmVybGF5V2FybmluZ3M6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIC8vIEN1c3RvbSBsb2dnZXIgdG8gZmlsdGVyIG91dCBITVIgbWVzc2FnZXNcbiAgY3VzdG9tTG9nZ2VyOiB7XG4gICAgLi4uY29uc29sZSxcbiAgICBpbmZvOiAobXNnLCBvcHRpb25zKSA9PiB7XG4gICAgICAvLyBGaWx0ZXIgb3V0IEhNUiB1cGRhdGUgbWVzc2FnZXNcbiAgICAgIGlmIChtc2cuaW5jbHVkZXMoJ1t2aXRlXSBobXIgdXBkYXRlJykpIHJldHVyblxuICAgICAgLy8gRmlsdGVyIG91dCBvdGhlciBjb21tb24gSE1SIG1lc3NhZ2VzXG4gICAgICBpZiAobXNnLmluY2x1ZGVzKCdobXI6dXBkYXRlJykgfHwgbXNnLmluY2x1ZGVzKCdob3QgdXBkYXRlZCcpKSByZXR1cm5cbiAgICAgIGNvbnNvbGUubG9nKG1zZywgb3B0aW9ucylcbiAgICB9LFxuICAgIHdhcm46IChtc2csIG9wdGlvbnMpID0+IHtcbiAgICAgIC8vIEZpbHRlciBvdXQgY29tbW9uIHdhcm5pbmdzIGlmIG5lZWRlZFxuICAgICAgaWYgKG1zZy5pbmNsdWRlcygnU291cmNlbWFwIGZvcicpICYmIG1zZy5pbmNsdWRlcygncG9pbnRzIHRvIG1pc3Npbmcgc291cmNlIGZpbGVzJykpIHJldHVyblxuICAgICAgY29uc29sZS53YXJuKG1zZywgb3B0aW9ucylcbiAgICB9LFxuICB9LFxuICAvLyBDbGVhciB0aGUgc2NyZWVuIG9uIHJlc3RhcnRcbiAgY2xlYXJTY3JlZW46IGZhbHNlLFxuICAvLyBMb2cgbGV2ZWxcbiAgbG9nTGV2ZWw6ICd3YXJuJyxcbiAgLy8gRGlzYWJsZSBzb3VyY2UgbWFwcyBpbiBkZXZlbG9wbWVudCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gIC8vIFlvdSBjYW4gcmUtZW5hYmxlIGlmIG5lZWRlZCBmb3IgZGVidWdnaW5nXG4gIGJ1aWxkOiB7XG4gICAgc291cmNlbWFwOiBtb2RlID09PSAnZGV2ZWxvcG1lbnQnID8gZmFsc2UgOiAnaGlkZGVuJyxcbiAgfSxcbiAgLy8gRGlzYWJsZSBDU1Mgc291cmNlIG1hcHMgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICBjc3M6IHtcbiAgICBkZXZTb3VyY2VtYXA6IGZhbHNlLFxuICB9LFxufSkpIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVixTQUFTLG9CQUFvQjtBQUMvVyxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0EsS0FBSztBQUFBO0FBQUEsTUFFSCxZQUFZO0FBQUEsTUFDWixTQUFTO0FBQUE7QUFBQSxNQUVULGlCQUFpQjtBQUFBLElBQ25CO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixHQUFHO0FBQUEsSUFDSCxNQUFNLENBQUMsS0FBSyxZQUFZO0FBRXRCLFVBQUksSUFBSSxTQUFTLG1CQUFtQixFQUFHO0FBRXZDLFVBQUksSUFBSSxTQUFTLFlBQVksS0FBSyxJQUFJLFNBQVMsYUFBYSxFQUFHO0FBQy9ELGNBQVEsSUFBSSxLQUFLLE9BQU87QUFBQSxJQUMxQjtBQUFBLElBQ0EsTUFBTSxDQUFDLEtBQUssWUFBWTtBQUV0QixVQUFJLElBQUksU0FBUyxlQUFlLEtBQUssSUFBSSxTQUFTLGdDQUFnQyxFQUFHO0FBQ3JGLGNBQVEsS0FBSyxLQUFLLE9BQU87QUFBQSxJQUMzQjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsYUFBYTtBQUFBO0FBQUEsRUFFYixVQUFVO0FBQUE7QUFBQTtBQUFBLEVBR1YsT0FBTztBQUFBLElBQ0wsV0FBVyxTQUFTLGdCQUFnQixRQUFRO0FBQUEsRUFDOUM7QUFBQTtBQUFBLEVBRUEsS0FBSztBQUFBLElBQ0gsY0FBYztBQUFBLEVBQ2hCO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
