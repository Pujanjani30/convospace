import apiClient from '@/lib/api-client';
import { useAppStore } from '@/store';
import { HOST, UPDATE_UNSEEN_MESSAGES_ROUTE } from '@/utils/constants';
import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      socketRef.current = io(HOST, {
        withCredentials: true,
        query: {
          userId: userInfo._id
        },
      });

      // Your existing message handler
      const handleReceiveMessage = (message) => {
        const {
          selectedChatType,
          selectedChatData,
          addMessage,
          dmContacts,
          setDmContacts,
          userInfo
        } = useAppStore.getState();

        const isCurrentChat =
          selectedChatType !== undefined &&
          selectedChatData &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id);

        const updateUnseenMessages = async () => {
          try {
            await apiClient.post(UPDATE_UNSEEN_MESSAGES_ROUTE, {
              userId: message.sender._id
            }, {
              withCredentials: true
            });
          } catch (error) {
            console.log("Error updating unseen messages:", error);
          }
        };

        if (isCurrentChat) {
          addMessage(message);
          updateUnseenMessages();
        }

        let contactId = message.sender._id === userInfo._id
          ? message.recipient._id
          : message.sender._id;

        let updatedContacts = [...dmContacts];
        const contactIndex = updatedContacts.findIndex(contact => contact._id === contactId);

        if (contactIndex !== -1) {
          const contact = { ...updatedContacts[contactIndex] };

          if (message.sender._id !== userInfo._id && !isCurrentChat) {
            contact.unseenCount = (contact.unseenCount || 0) + 1;
            contact.lastMessageTime = message.timestamp;
          }

          updatedContacts.splice(contactIndex, 1);
          updatedContacts.unshift(contact);
        } else {
          updatedContacts.unshift({
            ...(
              message.sender._id === userInfo._id
                ? message.recipient
                : message.sender
            ),
            unseenCount: message.sender._id === userInfo._id ? 0 : 1,
            lastMessageTime: message.timestamp
          });
        }
        setDmContacts(updatedContacts);
      };

      // Handle initial online users list (when you first connect)
      const handleOnlineUsers = (onlineUserIds) => {
        const { setOnlineUsers } = useAppStore.getState();
        setOnlineUsers(new Set(onlineUserIds));
      };

      // Handle individual user status changes
      const handleUserStatusChanged = (data) => {
        const { updateUserOnlineStatus } = useAppStore.getState();
        const { userId, isOnline } = data;

        updateUserOnlineStatus(userId, isOnline);
      };

      // Handle typing indicators
      const handleUserTyping = (data) => {
        const { setUserTyping } = useAppStore.getState();
        const { userId, isTyping } = data;

        setUserTyping(userId, isTyping);

        // Auto-cleanup typing indicator after 3 seconds
        if (isTyping) {
          setTimeout(() => {
            const { cleanupTypingUsers } = useAppStore.getState();
            cleanupTypingUsers();
          }, 3000);
        }
      };

      // Socket event listeners
      socketRef.current.on("receiveMessage", handleReceiveMessage);
      socketRef.current.on("onlineUsers", handleOnlineUsers);
      socketRef.current.on("userStatusChanged", handleUserStatusChanged);
      socketRef.current.on("userTyping", handleUserTyping);

      // Cleanup on disconnect
      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [userInfo]);

  // Utility functions to emit socket events
  const emitTyping = (recipientId, isTyping) => {
    if (socketRef.current) {
      console.log(`Emitting typing status: ${isTyping} to ${recipientId}`);
      socketRef.current.emit("typing", { recipientId, isTyping });
    }
  };

  const updateUserStatus = (status) => {
    if (socketRef.current) {
      console.log(`Updating user status to: ${status}`);
      socketRef.current.emit("updateStatus", status);
    }
  };

  const socketValue = {
    socket: socketRef.current,
    emitTyping,
    updateUserStatus
  };

  return (
    <SocketContext.Provider value={socketValue}>
      {children}
    </SocketContext.Provider>
  );
};