import { Client } from "@stomp/stompjs";
import axios from "axios";
import SockJS from "sockjs-client";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080"
const WEBSOCKET_URL = `${API_BASE_URL}/chat`

// connect user
export const connectUser = async (userId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/connect?userId=${userId}`);
        console.log('Connection response: ', response.data);
        return true;
    } catch (err) {
        console.error("Error in connection response: ", err);
        return false;
    }
};

// fetch users
export const fetchUsers = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/get-all/except/${userId}`)
        console.log("Users ", response.data);
        return response.data;
    } catch (err) {
        console.error("Error fetching users: ", err);
        return [];
    }
}

// set user offline
export const setUserOffline = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/${userId}/offline`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            console.log('Sent offline status via PATCH for user: ', userId);
        } else {
            throw new Error('PATCH request failed');
        }
    } catch (err) {
        console.error('PATCH failed, falling back to sendBeacon: ', err)
        navigator.sendBeacon(`http://localhost:8080/user/${userId}/offline/post`); 
        return false;
    }
}

// fetch filtered messages
export const fetchFilteredMessages = async (senderId, receiverId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/message/get/filtered/${senderId}/${receiverId}`) 
        console.log('filtered messages: ', response.data);
        return response.data;
    } catch (err) {
        console.error('Error fetching filtered messages: ', err);
        return [];
    }
}

// WebSocket connection setup
export const setUpWebSocket = async (senderId, onMessageReceived, onUserUpdate, onConnect, onDisconnect) => {
    const socket = new SockJS(WEBSOCKET_URL);
    const client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
            login: senderId,
        },
        debug: (str) => console.log("STOMP Debug: ", str),
        reconnectDelay: 30000,
        onConnect: async () => {
            console.log("Websocket connected successfully");
            onConnect(client);

            client.subscribe("/topic/messages", (message) => {
                const receivedMessage = JSON.parse(message.body);
                console.log("Received message: ", receivedMessage);
                onMessageReceived(receivedMessage);
            });

            client.subscribe("/topic/users", (users) => {
                const updatedUser = JSON.parse(users.body);
                console.log("Received user update: ", updatedUser);
                onUserUpdate(updatedUser);
            })
        },
        onStompError: (frame) => {
            console.error("STOMP error: ", frame.headers["message"]);
            onDisconnect();
        },
        onDisconnect: () => {
            console.log("Websocket Disconnected");
            onDisconnect();
        }
    });

    console.log("Activating STOMP client...");
    client.activate();
    return client;
}

// send message
export const sendMessage = async (client, senderId, receiverId, messageText) => {
    const message = {
        sender: { id: senderId },
        receiver: { id: receiverId },
        messageText
    };
    if (client && client.connected) {
        console.log('Sending message via WebSocket:', message);
        client.publish({
            destination: '/app/send',
            body: JSON.stringify(message)
        });
    } else {
        console.error('STOMP client not connected');
    }
};