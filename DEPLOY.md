# Deployment Guide

This application is configured for seamless deployment on **Vercel**.

## 🚀 How to Deploy

1.  **Push to GitHub/GitLab/Bitbucket**: Ensure your code is pushed to a remote repository.
2.  **Import to Vercel**:
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **"Add New..."** -> **"Project"**.
    *   Import your repository.
3.  **Configure Environment Variables**:
    *   In the "Environment Variables" section, add:
        *   `GEMINI_API_KEY`: Your Google Gemini API Key.
4.  **Deploy**: Click **"Deploy"**.

## 🌐 CORS & Proxy Handling

This app includes a built-in **Serverless Proxy** (`/api/proxy`) to handle Azure authentication and requests.

*   **In Deployment**: The app automatically uses this internal proxy. You do **not** need to configure anything.
*   **Local Development**: The internal proxy is not available (unless using `vercel dev`). You should continue using the "Advanced Settings" > "Proxy URL" with a tool like `local-cors-proxy` as described in the app.

## 🔒 Security Note

While the proxy solves the CORS issue, please note that using the **Client Credentials Flow** (Client ID + Secret) from a frontend application (even via a proxy) carries security risks. The Client Secret is sent from your browser to the proxy. Ensure you only use this on secure networks and consider rotating credentials if you suspect a leak.
