import { useLocation } from "react-router-dom";
import styles from "./Chat.module.css"
import chatImage from '../../assets/chat.png';
import womanImage from '../../assets/woman.png';
import manImage from '../../assets/man.png';
import { FiSearch, FiSend, FiX } from 'react-icons/fi';
import { isToday, isYesterday, format } from 'date-fns';
import { connectUser, fetchFilteredMessages, fetchUsers, sendMessage, setUpWebSocket, setUserOffline } from "../../service/chatService";
const { useState, useEffect, useRef, useCallback } = require("react");

function Chat() {
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const { state } = useLocation();
    const senderId = state?.userId;
    const selectedUserRef = useRef(selectedUser);
    const isWebSocketConnectedRef = useRef(false);
    const processedMessageIds = useRef(new Set());
    const clientRef = useRef(null);

    const profileImages = [manImage, womanImage];

    // handleSelectedUser change for message subscribe
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    // get randomImages
    const getRandomImage = () => {
        const randomIndex = Math.floor(Math.random() * profileImages.length);
        return profileImages[randomIndex];
    };

    // get initial letters from name
    const getInitials = (name) => {
        if (!name) return ''; 
        const nameParts = name.trim().split(' '); 
        const firstInitial = nameParts[0]?.charAt(0)?.toUpperCase() || '';
        const lastInitial = nameParts.length > 1 
            ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() 
            : '';
        return `${firstInitial}${lastInitial}`;
    };

    // Filtering message according to sender and user
    const handleUserSelect = async (user) => {
        setSelectedUser(user);
        console.log('Selected user: ', user);
        try {
            // const response = await axios.get(`http://localhost:8080/message/get/filtered/${senderId}/${user.id}`);
            const response = await fetchFilteredMessages(senderId, user.id);
            console.log('filteredMessages ', response);
            setFilteredMessages(response);

            setFilteredUsers(prevUsers => {
                const updatedUsers = [...prevUsers];
                const userIndex = updatedUsers.findIndex(u => u.id === user.id);
                if (userIndex !== -1) {
                    updatedUsers[userIndex] = {
                        ...updatedUsers[userIndex],
                        unreadMessageCount: 0
                    };
                    console.log('Reset unreadCount for user:', updatedUsers[userIndex]);
                }
                console.log("updatedUsers: ", updatedUsers);
                return updatedUsers;
            });
        } catch (err) {
            console.error('Error fetching data ', err);
        }
    }

    // format the last message time
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    // sending message
    const handleSendMessage = async (id, msg) => {
        sendMessage(clientRef.current, senderId, id, msg);
        setMessageInput("");
    };

    // filtered messages
    const filterMessages = useCallback((user) => { 
        if (!user) {
            setFilteredMessages([]);
            return;
        }

        setFilteredMessages(messages.filter(msg =>
            (msg.sender.id === senderId && msg.receiver.id === user.id) ||
            (msg.sender.id === user.id && msg.receiver.id === senderId)
        ));
    }, [messages, senderId]);

    // filter users
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredUsers(users);
            return;
        }
        const lowerQuery = query.toLowerCase();
        const filtered = users.filter(user => 
            (user.name && user.name.toLowerCase().includes(lowerQuery)) ||
            (user.email && user.email.toLowerCase().includes(lowerQuery)) ||
            (user.phoneNo && user.phoneNo.toLowerCase().includes(query))
        );
        setFilteredUsers(filtered);
    }

    // websocket connection
    useEffect(() => {
        const initializeData = async () => {
            const userData = await fetchUsers(senderId);
            const userWithImages = userData.map((user) => ({
                ...user,
                name: user.name || "",
                email: user.email || "",
                phoneNo: user.phoneNo || "",
                offline: user.offline ?? true,
                profileImage: getRandomImage(),
                lastMessage:
                    user.lastMessage && user.lastMessageSenderId === senderId
                        ? `You: ${user.lastMessage}`
                        : user.lastMessage,
                unreadMessageCount: user.unreadMessageCount || 0,
            }));
            setUsers(userWithImages);
            setFilteredUsers(userWithImages);
        };

        const onMessageReceived = (receivedMessage) => {
            if (processedMessageIds.current.has(receivedMessage.id)) {
                console.log("Duplicate message ignored: ", receivedMessage.id);
                return;
            }
            processedMessageIds.current.add(receivedMessage.id);
            console.log("Processing message: ", receivedMessage);
            setFilteredMessages((prevMessages) => {
                if (prevMessages.some((msg) => msg.id === receivedMessage.id)) {
                    return prevMessages;
                }
                if (selectedUserRef.current && (
                    (receivedMessage.sender.id === senderId && receivedMessage.receiver.id === selectedUserRef.current.id) ||
                    (receivedMessage.sender.id === selectedUserRef.current.id && receivedMessage.receiver.id === senderId)
                )) {
                    return [...prevMessages, receivedMessage];
                }
                console.log('Message not relevant to current user:', receivedMessage);
                return prevMessages;
            });

            setFilteredUsers((prevUsers) => {
                const updatedUsers = [...prevUsers];
        
                // Update last message for outgoing messages (from senderId to receiver)
                const receiverIndex = updatedUsers.findIndex(u => u.id === receivedMessage.receiver.id);
                if (receiverIndex !== -1 && receivedMessage.sender.id === senderId) {
                    console.log("Outgoing message ", updatedUsers[receiverIndex]);
                    updatedUsers[receiverIndex] = {
                        ...updatedUsers[receiverIndex],
                        offline: updatedUsers[receiverIndex].offline,
                        lastMessage: `You: ${receivedMessage.messageText}`, // Prefix 'You: ' for outgoing
                        lastMessageSentAt: receivedMessage.sentAt || new Date().toISOString(),
                    };
                }
        
                // Update last message and unread count for incoming messages (from sender to senderId)
                const senderIndex = updatedUsers.findIndex(u => u.id === receivedMessage.sender.id);
                if (senderIndex !== -1 && receivedMessage.receiver.id === senderId) {
                    console.log("Incoming message ", updatedUsers[senderIndex]);
                    updatedUsers[senderIndex] = {
                        ...updatedUsers[senderIndex],
                        offline: updatedUsers[senderIndex].offline,
                        lastMessage: receivedMessage.messageText,
                        lastMessageSentAt: receivedMessage.sentAt || new Date().toISOString(),
                        // Only increment unread count if the sender isn’t the selected user
                        unreadMessageCount: (!selectedUserRef.current || selectedUserRef.current.id !== receivedMessage.sender.id)
                            ?  (updatedUsers[senderIndex].unreadMessageCount || 0) + 1
                            : updatedUsers[senderIndex].unreadMessageCount || 0,
                    };
                }
                return updatedUsers;
            });
        };

        const onUserUpdate = (updatedUser) => {
            if (updatedUser.id === senderId) return;
            setFilteredUsers((prevUsers) => {
                const existingUserIndex = prevUsers.findIndex(u => u.id === updatedUser.id);
                if (existingUserIndex === -1) {
                    const userWithImage = { ...updatedUser, profileImage: getRandomImage() };
                    console.log('Adding new user to list: ', userWithImage);
                    return [ ...prevUsers, userWithImage ];
                } else {
                    const updatedUsers = [...prevUsers];
                    updatedUsers[existingUserIndex] = {
                        ...updatedUsers[existingUserIndex],
                        offline: updatedUsers[existingUserIndex].offline || updatedUser.offline,
                        lastMessage: updatedUsers[existingUserIndex].lastMessage || updatedUser.lastMessage,
                        lastMessageSentAt: updatedUsers[existingUserIndex].lastMessageSentAt || updatedUser.lastMessageSentAt,
                        unreadMessageCount: updatedUsers[existingUserIndex].unreadMessageCount || 0
                    };
                    console.log('Updated user status - ID:', updatedUsers[existingUserIndex].id, 'Offline:', updatedUsers[existingUserIndex].offline, 'lastMessage:', updatedUsers[existingUserIndex].lastMessage,
                    'lastMessageSentAt:', updatedUsers[existingUserIndex].lastMessageSentAt,
                    'UnreadCount:', updatedUsers[existingUserIndex].unreadMessageCount);
                    return updatedUsers;
                }
            });
        }

        const onConnect = async (client) => {
            clientRef.current = client;
            isWebSocketConnectedRef.current = true;
            await connectUser(senderId);
            await initializeData();
        };

        const onDisconnect = async () => {
            isWebSocketConnectedRef.current = false;
            clientRef.current = null;
        }

        if (!isWebSocketConnectedRef.current) {
            const client = setUpWebSocket(senderId, onMessageReceived, onUserUpdate, onConnect, onDisconnect);
            clientRef.current = client;
        }

        const handleUnload = async () => {
            if (clientRef.current && clientRef.current.connected) {
                await clientRef.current.deactivate();
                await setUserOffline(senderId); 
            }
        };

        window.addEventListener("unload", handleUnload);

        return () => {
            window.removeEventListener("unload", handleUnload);
            if (clientRef.current && clientRef.current.connected) {
                clientRef.current.deactivate();
            }
            isWebSocketConnectedRef.current = false;
        };
    }, [senderId]);

    useEffect(() => {
        filterMessages(selectedUser); 
    }, [messages, selectedUser, filterMessages]); 

    // auto scroll
    useEffect(() => {
        const messagesArea = document.querySelector(`.${styles.messagesArea}`);
        if (messagesArea) {
            setTimeout(() => {
                messagesArea.scrollTo({
                    top: messagesArea.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }, [filteredMessages]);

    // formate date
    const formatDateCustom = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);

        if (isToday(date)) {
            return 'Today';
        }

        if (isYesterday(date)) {
            return 'Yesterday';
        }

        return format(date, 'd MMMM yyyy');
    };

    // set show profile
    const handleShowProfile = () => {
        setShowProfile(true);
    };
    
    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <div className={styles.leftContainer}>
                    <div className={styles.chatImageContainer}>     
                        <img src={chatImage} alt="Chat-image" className={styles.chatImage}/>
                    </div>
                    <div className={styles.searchBarContainer}>
                        <FiSearch className={styles.searchIcon} aria-hidden="true" />
                        <input type="text" 
                            className={styles.searchBar} 
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)} 
                            aria-label="search users by email or mobile"/>
                    </div>
                    <div className={styles.usersContainer}>
                            { filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <div key={user.id} className={styles.user}
                                        onClick={() => handleUserSelect(user)}> 
                                        <div className={styles.userShortName}>
                                            { getInitials(user.name) }
                                            { !user.offline && (
                                                <div className={styles.onlineDot}></div>
                                            )}
                                        </div>
                                        <div className={styles.userAnduserMsg}>
                                            <div className={styles.userName}>
                                                { user.name }
                                                <span className={styles.lastMessageTime}>{ formatTimestamp(user.lastMessageSentAt) }</span>
                                            </div>
                                            <div className={styles.userLastMsgContainer}>
                                                { user.lastMessage ? (
                                                    <>
                                                        <span className={styles.lastMsg}>{user.lastMessage}</span>
                                                        { user.unreadMessageCount > 0 && (
                                                            <span className={styles.unreadMessageCount}>{ user.unreadMessageCount }</span> 
                                                        )}
                                                    </>
                                                ) : <span></span>}
                                            </div>
                                        </div>
                                    </div>                    
                                ))
                            ) : ( <div className={styles.user}></div> )
                            }
                    </div>
                </div>
                <div className={styles.rightContainer}>
                    {selectedUser ? (
                        <>
                            <div className={styles.userInformationContainer}>
                                <div className={styles.userPhoto}>
                                    <img src={selectedUser.profileImage} className={styles.personImage} alt={`${selectedUser.name} Profile`} />
                                </div>
                                <div className={styles.userProfileName} onClick={handleShowProfile}>
                                    { selectedUser.name }
                                </div>
                            </div>
                            <div className={styles.messagesArea}>
                                <div className={styles.day}>
                                    { formatDateCustom( new Date()) }
                                </div>
                                { filteredMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={msg.sender.id === senderId ? styles.senderMessage : styles.receiverMessage}
                                    >
                                        <p>{ msg.messageText }</p>
                                        <span className={styles.date}>
                                            <p>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.messageInput}>
                                    <input 
                                        type="text"
                                        className={styles.message}
                                        placeholder="Message"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && messageInput.trim() !== '') {
                                                handleSendMessage(selectedUser.id, messageInput);
                                            }
                                        }}
                                    />
                                    <span className={styles.sendIconStorage}>
                                        <FiSend 
                                            className={styles.sendIcon} 
                                            onClick={() => handleSendMessage(selectedUser.id, messageInput)}
                                            aria-label="send message" 
                                        />
                                    </span>
                            </div>
                        </>
                    ) : null
                    }            
                </div>
                {showProfile && (
                    <div className={styles.userProfileContainer}>
                        <FiX size={20} 
                        className={styles.closeButton}
                        onClick={() => setShowProfile(false)}/>
                        <div className={styles.profileContent}>
                            <img 
                                src={selectedUser.profileImage} 
                                alt={`${selectedUser.name} Profile`} 
                                className={styles.userProfileImage}
                            />
                            <div className={styles.profileDetails}>
                                <p className={styles.userProfilenAme}>{selectedUser.name}</p>
                                <p className={styles.userProfilePhoneNo}>{selectedUser.phoneNo}</p>
                                <p className={styles.userProfileEmail}>{selectedUser.email}</p>
                                <div className={styles.finalBorder}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;