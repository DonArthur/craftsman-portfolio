# 🛠️ Software Craftsman's Workshop - 3D Portfolio

An interactive, 3D isometric portfolio built to showcase software engineering skills through the metaphor of a physical craftsman's workshop. 

Instead of a traditional scrolling website, visitors navigate a cozy, low-poly 3D room where physical objects represent different aspects of your professional profile (e.g., a Workbench for projects, a Blueprint Table for architecture, Shelves for tech stack).

## ✨ Features

* **Interactive 3D Environment:** Built entirely in the browser using React Three Fiber.
* **Raw Camera Animation:** Buttery-smooth camera transitions using native `useFrame` and `lerp` math without heavy animation libraries.
* **Immersive UI:** 3D objects glow and reveal standard, accessible HTML text tags on hover using `@react-three/drei`'s `<Html>` component.
* **Modern Styling:** Powered by the newly released Tailwind CSS v4 via the Vite plugin for ultra-fast, zero-config styling.
* **Low-Poly Aesthetic:** Optimized for high performance across all devices.

## 🚀 Tech Stack

* **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **3D Engine:** [Three.js](https://threejs.org/)
* **React Integration:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) (R3F)
* **3D Helpers:** [@react-three/drei](https://github.com/pmndrs/drei)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)

## 📦 Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1.  Clone the repository or download the source code.
2.  Open your terminal and navigate to the project directory:
    ```bash
    cd craftsman-portfolio
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```
4.  Start the local development server:
    ```bash
    npm run dev
    ```
5.  Open `http://localhost:5173` in your browser.

## 🏗️ Project Structure

* `src/App.tsx`: The main application file containing the 3D `<Canvas>`, the `CameraRig` for smooth transitions, the `WorkshopRoom` environment, and the 2D HUD overlay.
* `src/index.css`: Contains the Tailwind v4 import (`@import "tailwindcss";`).
* `vite.config.ts`: Configured with the `@tailwindcss/vite` plugin.

## 🛠️ Customization

To add new interactive objects to your workshop:
1. Create a new component similar to `<WorkbenchItem />`.
2. Define its 3D geometry (`<boxGeometry>`, `<cylinderGeometry>`, etc.) and position it in the room.
3. Add the hover state logic for glowing effects.
4. Add an `<Html>` component for the floating label.
5. Update the `CameraRig` to handle zooming to the new object's coordinates when clicked.

---
*Designed and built with precision.*