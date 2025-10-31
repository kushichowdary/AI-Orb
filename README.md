# JARVIS - AI Language Assistant

---

<img src="https://github.com/user-attachments/assets/fec11c27-9454-4671-bd05-d499fb98707f" alt="Alt text" width="1766" height="842">

---

JARVIS is your personal AI conversation partner, ready to help with a wide range of tasks. Ask for recipes, learn about new topics, get help with coding, or practice speaking in a new language. Engage in fluid, real-time spoken conversations with a helpful and knowledgeable AI.

This application provides a seamless voice-first experience, allowing you to converse naturally with an AI that understands and responds in real-time.

## Features

-   **Versatile AI Assistant:** Get help with cooking by asking for recipes, learn about new subjects, get explanations for coding problems, and more.
-   **Seamless Real-time Conversation:** Speak naturally and receive instant, human-like audio responses.
-   **Multi-language Support:** Converse in English, Spanish, French, German, Hindi, or Telugu.
-   **Voice-Activated Start:** Simply say "Hey JARVIS" to begin your session for a hands-free experience.
-   **Dynamic Visual Feedback:** An interactive orb visualizer provides real-time feedback, reacting to your voice and the AI's responses.

## How to Use

1.  **Select Your Language:** Open the application and choose your preferred language from the dropdown menu on the main screen.
2.  **Start the Conversation:**
    -   **Voice Command:** Say the wake phrase "Hey JARVIS".
    -   **Manual Start:** Tap the central orb on the screen.
3.  **Engage in Conversation:** Begin speaking. The orb's animation will change to show when it's listening to you and when it's speaking. Ask for recipes, coding help, or anything else you'd like to learn or discuss.
4.  **End the Session:** When you're finished, click the "Stop" button to conclude the conversation.

## Technology

This application leverages modern web technologies to deliver a responsive and interactive experience:

-   **Frontend:** Built with React and TypeScript for a robust and maintainable user interface.
-   **Core AI:** Powered by Google's Gemini API for natural language understanding and real-time audio generation.
-   **Audio I/O:** Utilizes the Web Audio API for real-time microphone input processing and audio output streaming.
-   **Wake Word Detection:** Implemented using the browser's native Web Speech API.

## Known Issues & Future Ideas

-   **Keyword Detection:** The Web Speech API for "Hey JARVIS" detection can be inconsistent across different browsers and may sometimes stop listening. A more robust, custom wake-word engine would be an improvement.
-   **Browser Support:** This app works best on modern desktop browsers like Chrome and Edge. Mobile browser support for the required audio APIs can be limited.
-   **Future: Conversation History:** A visual transcript of the conversation could be added to allow users to review their session.
-   **Future: More Voices:** The AI voice is currently fixed. An option to choose different voices could be implemented.

---

This project is a demonstration of creating interactive, voice-first AI experiences on the web.