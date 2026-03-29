// Get the correct API URL based on environment
export const getApiUrl = () => {
  // For development builds
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL_DEV || "http://localhost:5000";
  }
  
  // For production builds
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL_PROD || "https://ai-app-vrh7.onrender.com";
  }
  
  // Fallback
  return "http://localhost:5000";
};
