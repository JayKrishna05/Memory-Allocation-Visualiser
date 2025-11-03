# Memory Allocation Visualization Tool

## Project Description
The Memory Allocation Visualization Tool is a browser-based interactive simulation designed to demonstrate memory allocation strategies used in operating systems.  
It enables users to visualize both **Fixed Partition** and **Variable Partition** allocation schemes and understand the step-by-step working of different allocation algorithms through animated graphics.

### Objectives
- To illustrate the internal working of memory allocation algorithms.
- To help users understand fragmentation and memory utilization.
- To provide a clear, visual explanation of how processes are assigned to memory blocks.

---

## Features Overview

### Core Functionality
- **Interactive Input Interface:** Users can enter block sizes, process sizes, and select an allocation algorithm and mode.
- **Algorithm Support:** Implements *First Fit*, *Best Fit*, and *Worst Fit* allocation strategies.
- **Partition Modes:** Supports both *Fixed* and *Variable* partition allocation.
- **Step-by-Step Simulation:** Each allocation step is displayed with a corresponding visual change.
- **Adjustable Speed Control:** Allows users to modify the animation speed for better understanding.
- **Execution Statistics Panel:** Displays used memory, free memory, allocated process count, and utilization percentage with a color-coded utilization bar.
- **Export Features:**
  - Export the current visualization as a PNG image.
  - Download a JSON trace of the execution steps.

---

## Operating System Concepts Covered
- **Memory Management**
  - Fixed Partition Allocation
  - Variable Partition Allocation
- **Allocation Algorithms**
  - First Fit
  - Best Fit
  - Worst Fit
- **Memory Utilization and Fragmentation**

---

## Technology Stack
- **HTML5:** Interface structure and content organization.
- **CSS3:** Styling and responsive layout.
- **JavaScript (ES6+):** Core logic, simulation control, and animations.
- **Canvas API:** Dynamic graphical visualization of memory blocks and process allocations.

---

## Platform and Deployment
- Runs locally in any modern web browser.
- Does not require installation or an internet connection.
- Fully client-side, with no backend dependencies.

---

## License
This project is intended for educational and academic purposes. Redistribution or modification for non-academic use requires permission.
