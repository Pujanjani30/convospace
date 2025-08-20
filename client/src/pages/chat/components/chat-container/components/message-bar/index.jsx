import { useSocket } from "@/context/SocketContext";
import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { UPLOAD_MESSAGE_FILE_ROUTE } from "@/utils/constants";
import EmojiPicker from "emoji-picker-react";
import { Paperclip, Send, SmilePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner";
import FilePreview from "./components/FilePreview";

const MessageBar = () => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("text");
  const [file, setFile] = useState(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setIsUploading,
    setFileUploadProgress,
  } = useAppStore();
  const { socket, emitTyping, emitChannelTyping } = useSocket();

  const fileRef = useRef(null);
  const emojiRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsDisabled(message.trim().length === 0 && !file);
  }, [message, file]);

  const handleSendMessage = async () => {
    let fileUrl = null;
    if (messageType === "file") {
      try {
        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);
        const response = await apiClient.post(UPLOAD_MESSAGE_FILE_ROUTE,
          formData,
          {
            withCredentials: true,
            onUploadProgress: (data) =>
              setFileUploadProgress(Math.round((100 * data.loaded) / data.total))
          }
        );

        console.log(response)
        if (response.status !== 200) {
          setIsUploading(false);
          toast.error("Somthing went wrong while sending the file!")
          return;
        }

        fileUrl = response.data.data.fileURL;
        console.log("fileUrl", fileUrl);
      } catch (error) {
        console.log(error);
      } finally {
        setIsUploading(false);
      }
    }

    if (selectedChatType === "dm") {
      const newMessage = {
        sender: userInfo._id,
        recipient: selectedChatData._id,
        messageType,
        content: messageType === "text" ? message : undefined,
        fileUrl: messageType === "file" ? fileUrl : undefined
      }

      socket.emit("sendMessage", newMessage)
      setMessage("");
      setFile(null);
      setMessageType("text");
    }

    if (selectedChatType === "channel") {
      const newChannelMessage = {
        sender: userInfo._id,
        channelId: selectedChatData._id,
        messageType,
        content: messageType === "text" ? message : undefined,
        fileUrl: messageType === "file" ? fileUrl : undefined
      }

      socket.emit("sendChannelMessage", newChannelMessage);
      setMessage("");
      setFile(null);
      setMessageType("text");
    }
  }

  let typingTimeout;

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    const { setUserTyping, isUserTyping, typingUsers, setTypingUsers, selectedChatType } = useAppStore.getState();

    if (!isUserTyping(userInfo._id)) {
      // selectedChatType === "dm" && setUserTyping(userInfo._id, true, selectedChatType);
      setUserTyping(userInfo._id, true)

      emitTyping(selectedChatData._id, true);

      // const typingUsersCopy = new Map(typingUsers);
      // typingUsersCopy.set(userInfo._id, { firstName: userInfo.firstName, isTyping: true, selectedChatType });
      // selectedChatType === "channel" && setTypingUsers(typingUsersCopy);

      // selectedChatType === "dm" && emitTyping(selectedChatData._id, true);
      // selectedChatType === "channel" && emitChannelTyping(selectedChatData._id, true, userInfo._id);
    }

    // Reset stop-typing timer
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      // selectedChatType === "dm" && setUserTyping(userInfo._id, false);
      setUserTyping(userInfo._id, false);
      emitTyping(selectedChatData._id, false)

      // const typingUsersCopy = new Map(typingUsers);
      // typingUsersCopy.delete(userInfo._id);
      // selectedChatType === "channel" && setTypingUsers(typingUsersCopy);

      // selectedChatType === "dm" && emitTyping(selectedChatData._id, false);
      // selectedChatType === "channel" && emitChannelTyping(selectedChatData._id, false, userInfo._id);
    }, 2000);
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiPickerToggle = () => {
    setIsEmojiPickerOpen((prev) => !prev);
  };

  const handleAddEmoji = (emojiObj) => {
    setMessage((prev) => prev + emojiObj.emoji);
  };

  const handleAttachmentClick = () => {
    if (fileRef.current) {
      setMessageType("file")
      fileRef.current.click();
    }
  }

  const validateFile = (file, maxSizeMB = 5) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      toast.error(`File size too large! Maximum allowed size is ${maxSizeMB}MB`);
      return false;
    }

    return true;
  }

  const handleAttachmentChange = async (e) => {
    const newFile = e.target.files[0];

    if (!validateFile(newFile, 5)) {
      return;
    }

    setFile(newFile)
  }

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <input type="file" className="hidden" ref={fileRef} onChange={handleAttachmentChange} />
      {
        file
          ? <FilePreview
            file={file}
            onCancel={() => setFile(null)}
            onChangeFile={handleAttachmentClick}
          />
          : <div className="flex flex-1 bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
            <textarea
              type="text"
              placeholder="EnterMessage"
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none resize-none"
              rows="1"
            />
            <button
              className="text-neutral-500 hover:text-white focus:text-white duration-300 transition-all"
            >
              <Paperclip onClick={handleAttachmentClick} />
            </button>

            <div className="relative">
              <button
                className={`text-neutral-500 hover:text-white focus:text-white duration-300 transition-all
              ${isEmojiPickerOpen ? "text-white" : ""}`}
                onClick={handleEmojiPickerToggle}
              >
                <SmilePlus />
              </button>
              <div className="absolute bottom-16 right-0" ref={emojiRef}>
                <EmojiPicker
                  theme="dark"
                  open={isEmojiPickerOpen}
                  onEmojiClick={handleAddEmoji}
                  onClose={handleEmojiPickerToggle}
                  autoFocusSearch={false}
                />
              </div>
            </div>
          </div>
      }
      <button
        className="bg-blue-700 rounded-md flex items-center justify-center w-15 h-15 focus:border-none focus:outline-none 
        focus:text-white duration-300 transition-all hover:bg-blue-600"
        onClick={handleSendMessage}
        disabled={isDisabled}
      >
        <Send size={28} />
      </button>
    </div>
  )
}
export default MessageBar