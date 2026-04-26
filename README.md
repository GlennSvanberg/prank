# Office Prank Dashboard

An overengineered office prank project featuring a real-time web dashboard and a native desktop executor. This project allows you to toggle various pranks from a sleek web interface and instantly execute them on a target computer using a Node.js client and Convex real-time backend.

## Architecture

1. **Dashboard**: A minimalist web app built with React, Vite, and TailwindCSS.
2. **Victim Client**: A lightweight Node.js/TypeScript background process that listens for prank triggers in real-time.
3. **Backend**: Powered by Convex for instantaneous real-time state synchronization.

---

## How to Run

You need two terminal windows to run both the Dashboard and the Victim Client.

### 1. Start the Dashboard & Backend
In your first terminal, navigate to the root of the project:

```bash
cd prank
npm install
npm run dev
```

This will simultaneously start the Convex backend and the Vite development server. 
- Open `http://localhost:5173` (or the port Vite provides) in your browser to view the Control Center.

### 2. Start the Victim Client
In your second terminal, navigate to the `victim-client` directory:

```bash
cd prank/victim-client
npm install
npm start
```

This script will connect to the real-time database and wait silently in the background.

### 3. Execute a Prank!
Go to the Dashboard in your web browser and toggle the "Hello World Popup" to **ON**. 
A native Windows popup will instantly appear on the computer running the Victim Client. When the popup is closed, the dashboard toggle will automatically flip back to **OFF**.
