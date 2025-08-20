export const createOnlineStatusSlice = (set, get) => ({
  onlineUsers: new Set(),
  typingUsers: new Map(),
  userLastSeen: new Map(),

  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),

  addOnlineUser: (userId) => set((state) => {
    const newOnlineUsers = new Set(state.onlineUsers);
    newOnlineUsers.add(userId);
    return { onlineUsers: newOnlineUsers };
  }),

  removeOnlineUser: (userId) => set((state) => {
    const newOnlineUsers = new Set(state.onlineUsers);
    newOnlineUsers.delete(userId);
    return { onlineUsers: newOnlineUsers };
  }),

  isUserOnline: (userId) => {
    const { onlineUsers } = get();
    return onlineUsers.has(userId);
  },

  setTypingUsers: (typingUsers) => set({ typingUsers }),

  setUserTyping: (userId, isTyping, selectedChatType) => set((state) => {
    const newTypingUsers = new Map(state.typingUsers);
    if (isTyping) {
      newTypingUsers.set(userId, Date.now());
    } else {
      newTypingUsers.delete(userId);
    }
    return { typingUsers: newTypingUsers };
  }),

  isUserTyping: (userId) => {
    const { typingUsers } = get();
    return typingUsers.has(userId);
  },

  cleanupTypingUsers: () => set((state) => {
    const newTypingUsers = new Map();
    const now = Date.now();
    const TYPING_TIMEOUT = 3000; // 3 seconds

    for (const [userId, timestamp] of state.typingUsers.entries()) {
      if (now - timestamp < TYPING_TIMEOUT) {
        newTypingUsers.set(userId, timestamp);
      }
    }

    return { typingUsers: newTypingUsers };
  }),

  setUserLastSeen: (userId, lastSeen = new Date()) => set((state) => {
    const newUserLastSeen = new Map(state.userLastSeen);
    newUserLastSeen.set(userId, lastSeen);
    return { userLastSeen: newUserLastSeen };
  }),

  getUserLastSeen: (userId) => {
    const { userLastSeen } = get();
    return userLastSeen.get(userId) || null;
  },

  updateUserOnlineStatus: (userId, isOnline) => {
    const { addOnlineUser, removeOnlineUser, setUserLastSeen } = get();

    if (isOnline) {
      addOnlineUser(userId);
      setUserLastSeen(userId, new Date());
    } else {
      removeOnlineUser(userId);
      setUserLastSeen(userId, new Date());
    }
  },

  getOnlineUsersCount: () => {
    const { onlineUsers } = get();
    return onlineUsers.size;
  },

  getOnlineContacts: () => {
    const { dmContacts, isUserOnline } = get();
    return dmContacts.filter(contact => isUserOnline(contact._id));
  }
});