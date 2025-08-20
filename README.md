AlgoZen - AI-Powered DSA Assistant
AlgoZen is a cross-platform desktop application designed to be an expert companion for anyone studying or working with Data Structures and Algorithms. It leverages the power of Google's Gemini Vision API to provide instant, intelligent analysis of algorithmic problems from screen captures, local files, or even a live webcam feed.

This tool was built to accelerate learning, simplify debugging, and provide a modern, interactive way to get feedback on DSA concepts.

✨ Features
Multi-Modal Input: Analyze code and algorithms from various sources:

📷 Screen Capture: Select any window on your desktop to get an analysis of the code within it.

📁 File Analysis: Open any local source code file for a detailed review.

Expert AI Analysis: Get structured, expert-level feedback on your DSA problems, including:

Conceptual Explanation: A clear breakdown of the underlying logic.

Code Correction: AI-powered suggestions and corrections for your implementation (defaults to Python).

Complexity Analysis: Automatic Big O analysis for time and space complexity.

Edge Case Identification: Highlights important edge cases to consider.

Modern & Intuitive UI: A clean, beautiful, and easy-to-use interface built with modern web technologies.

🛠️ Technologies Used
Core Framework: Electron.js

Backend Logic: Node.js

Frontend Interface: HTML5, Tailwind CSS

AI Engine: Google Gemini Vision API

Packaging: electron-builder

📖 How to Use
Launch the application. You will be greeted by the AlgoZen interface.

(Optional) Provide Context: Type a specific question or context in the input box (e.g., "Why is my merge sort implementation not working?").

Choose an Analysis Method:

Click Analyze Screen to select an open window for analysis.

Click Analyze File to open a local code file.

View the Results: The AI's detailed analysis will appear in the chat window.

📦 Building for Production
To package the application into a distributable installer (.exe, .dmg, etc.), you can use the built-in script.

Ensure your icon is ready: Place your application icon (icon.ico for Windows, icon.icns for Mac) inside a build folder in the project root.

Run the build command:

npm run build

The completed installer will be available in the dist folder.

©️ License & Copyright
Made by Shivaji © 2025. All rights reserved.

This project is for personal and educational use. Please do not distribute without permission.