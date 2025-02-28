# Realtime chat messaging system

Features
  - Real-Time Messaging: Chat with users instantly with live updates.
  - User Discovery: Search and connect with other users easily.
  - Profile Viewing: Access detailed user profiles for a personalized experience.
  - Online/Offline Status: See who’s available at a glance.
  - Offline Messaging: Send messages to offline users with unread count tracking.
  - UI: Intuitive and interactive design.
  
## Getting started

### Prerequisite (Tools & technologies)
  Backend
  - Spring Boot
  - Spring Data JPA
  - Spring WebSocket
  - Spring Messaging (STOMP Protocol)
  - CORS
  - Lombok
  - H2 Database

  Frontend
  - ReactJS
  - React Router
  - SockJS
  - Stomp.js
  - CSS
  
  Development tools
  - VS Code
  - IntelliJ IDEA

### Installation
1. Clone the Repository
- Open CMD/Terminal
- git clone https://github.com/codeForlife-007/real-time-chat-messaging-system.git
- cd real-time-chat-messaging-system

2. Setup Frontend with VS Code
- In terminal,
- cd chat-fronted
- code .
- create .env file in root folder
- Define one constant REACT_APP_API_URL with backend url Eg.(REACT_APP_API_URL=http://localhost:8080)

3. Setup IntelliJ IDEA
- Open folder chat-backend
- Open Edit Configuration
- Add new Configuration (Application)
- Add Main class
- Environment Variables field add your frontend URL Eg.(FRONTEND_URL=http://localhost:3000/)
- Click Apply & OK

### Running the application
Frontend
- In VS Code terminal,
- npm install (Make sure npm is installed)
- npm start

Backend
- Click on Run button in IntelliJ IDEA

### How to use?
- Open two tabs in browser
- Login with different users
- & start chatting
