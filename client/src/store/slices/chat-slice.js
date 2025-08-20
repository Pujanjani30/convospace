export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  dmContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],

  setSelectedChatType: (type) => { set({ selectedChatType: type }) },

  setSelectedChatData: (data) => { set({ selectedChatData: data }) },

  setSelectedChatMessages: (messages) => { set({ selectedChatMessages: messages }) },

  setDmContacts: (contacts) => { set({ dmContacts: contacts }) },

  setIsUploading: (isUploading) => { set({ isUploading }) },

  setIsDownloading: (isDownloading) => { set({ isDownloading }) },

  setFileUploadProgress: (progress) => { set({ fileUploadProgress: progress }) },

  setFileDownloadProgress: (progress) => { set({ fileDownloadProgress: progress }) },

  setChannels: (channels) => { set({ channels }) },

  closeChat: () => {
    set({
      selectedChatType: undefined,
      selectedChatData: undefined,
      selectedChatMessages: []
    })
  },

  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;

    set({
      selectedChatMessages: [...selectedChatMessages, {
        ...message,
        sender: selectedChatType === 'channel' ? message.sender : message.sender._id,
        recipient: selectedChatType === 'channel' ? message.recipient : message.recipient._id
      }]
    })
  },

  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [channel, ...channels] });
  }
})