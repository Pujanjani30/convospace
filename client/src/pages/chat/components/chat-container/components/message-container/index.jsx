import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_CHANNEL_MESSAGES_ROUTE, GET_MESSAGES_ROUTE, HOST } from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import FileDisplay from "./components/FileDisplay.jsx";
import { Download, X } from "lucide-react";
import { getColor } from "@/lib/utils.js";

const MessageContainer = () => {
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    userInfo
  } = useAppStore();
  const scrollRef = useRef(null);

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages])

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await apiClient.get(GET_MESSAGES_ROUTE, {
          params: {
            userId: selectedChatData._id
          },
          withCredentials: true
        })

        if (res.data.data) {
          setSelectedChatMessages(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to fetch messages. Please try again later.");
      }
    }

    const getChannelMessages = async () => {
      try {
        const res = await apiClient.get(GET_CHANNEL_MESSAGES_ROUTE, {
          params: { channelId: selectedChatData._id },
          withCredentials: true
        })

        if (res.data.data) {
          setSelectedChatMessages(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching channel messages:", error);
        toast.error("Failed to fetch channel messages. Please try again later.");
      }
    }

    if (selectedChatData._id) {
      if (selectedChatType === "dm") getMessages();
      if (selectedChatType === "channel") getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  const handleShowImage = (image) => {
    setShowImage(true);
    setImageURL(image);
  }

  const downloadFile = async (fileUrl) => {
    try {
      // Fetch directly from Cloudinary
      const response = await apiClient.get(fileUrl, {
        responseType: "blob",
      });

      // Create Blob URL
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlBlob;

      const filename = fileUrl.split("/").pop().split("?")[0] || `file-${Date.now()}`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      toast.error("Failed to download file. Please try again later.");
    }
  };

  const cancelShowImage = () => {
    setImageURL(null);
    setShowImage(false);
  }

  const renderMessages = () => {
    let lastDate = null;

    return (
      <AnimatePresence initial={false}>
        {
          selectedChatMessages.map((message, index) => {
            const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
            const showDate = messageDate !== lastDate;
            lastDate = messageDate;

            return (
              <motion.div
                key={message._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* {showDate && <div className="flex justify-center items-center my-3">
                  <div className="bg-gray-500 h-[1px] w-full"></div>
                  <div className="text-center text-gray-500 min-w-fit px-5">{moment(message.timestamp).format("LL")}</div>
                  <div className="bg-gray-500 h-[1px] w-full"></div>
                </div>
                } */}
                {
                  showDate && <div className="text-center text-gray-500 my-3">
                    {moment(message.timestamp).format("LL")}
                  </div>
                }
                {
                  selectedChatType === "dm" ? renderDMMessage(message) : null
                }
                {
                  selectedChatType === "channel" ? renderChannelMessage(message, selectedChatMessages[index - 1]) : null
                }
              </motion.div>
            )
          })
        }
      </AnimatePresence>
    )
  }

  const renderDMMessage = (message) => {
    const isSender = message.sender !== selectedChatData._id;
    return (
      <div className={`${!isSender ? "text-left" : "text-right"}`}>

        {
          message.messageType === "text" && (
            <div
              className={`
                ${isSender
                  ? "bg-blue-500 text-white ml-auto rounded-br-md"
                  : "bg-gray-200 text-gray-900 mr-auto rounded-bl-md"
                } 
                inline-block px-4 py-2 rounded-2xl my-1.5 max-w-[75%] 
                whitespace-pre-wrap break-words shadow-sm leading-relaxed`}
            >
              {message.content}
            </div>
          )
        }
        {
          message.messageType === "file" && (
            <div
              className={`
                ${isSender
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-gray-900 mr-auto"
                } 
                inline-block p-1 rounded-2xl my-1.5 max-w-[75%] shadow-sm`}
            >
              <FileDisplay
                message={message}
                renderFor={message.sender !== selectedChatData._id ? "sender" : "recipient"}
                downloadFile={downloadFile}
                handleShowImage={handleShowImage}
              />
            </div>
          )
        }
        <div className="text-xs text-gray-600">
          {moment(message.timestamp).format('LT')}
        </div>
      </div>
    );
  }

  const renderChannelMessage = (message, previousMessage) => {
    const isSender = message.sender._id === userInfo._id;
    const showSenderInfo = !isSender && (
      !previousMessage ||
      previousMessage.sender._id !== message.sender._id
    );
    return (
      <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}>

        {!isSender && showSenderInfo && (
          <div className="flex-shrink-0 mr-3">
            {message.sender.profilePic ? (
              <img
                src={message.sender.profilePic}
                alt={`${message.sender.firstName} ${message.sender.lastName}`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white
                   text-sm font-medium ${getColor(message.sender.profileColor)}`}
              >
                {message.sender.firstName[0]}
              </div>
            )}
          </div>
        )}

        {!isSender && !showSenderInfo && (
          <div className="w-8 mr-3"></div>
        )}

        <div className="flex flex-col max-w-[75%]">
          {/* Sender name for other users */}
          {!isSender && showSenderInfo && (
            <div className="text-xs text-gray-600 mb-1 ml-1">
              {message.sender.firstName} {message.sender.lastName}
            </div>
          )}

          {/* Message content */}
          {message.messageType === "text" && (
            <div
              className={`
              ${isSender
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
                } 
              inline-block px-4 py-2 rounded-2xl shadow-sm leading-relaxed
              whitespace-pre-wrap break-words
              ${isSender ? "rounded-br-md" : "rounded-bl-md"}
            `}
            >
              {message.content}
            </div>
          )}

          {message.messageType === "file" && (
            <div
              className={`
              ${isSender
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
                } 
              inline-block p-1 rounded-xl shadow-sm
              ${isSender ? "rounded-br-md" : "rounded-bl-md"}
            `}
            >
              <FileDisplay
                message={message}
                renderFor={isSender ? "sender" : "recipient"}
                downloadFile={downloadFile}
                handleShowImage={handleShowImage}
              />
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs text-gray-500 mt-1 ${isSender ? "text-right" : "text-left"}`}>
            {moment(message.timestamp).format('LT')}
            {isSender && (
              <span className="ml-1">
                {/* Add read status icons here if needed */}
              </span>
            )}
          </div>
        </div>

        {/* Avatar for current user (right side) - optional */}
        {isSender && showSenderInfo && (
          <div className="flex-shrink-0 ml-3">
            {userInfo.profilePic ? (
              <img
                src={userInfo.profilePic}
                alt="You"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white
                   text-sm font-medium ${getColor(userInfo.profileColor)}`}
              >
                {userInfo.firstName[0]}{userInfo.lastName[0]}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef} />
      {
        showImage &&
        <div className="fixed z-[1000] top-0 left-0 h-screen w-screen flex items-center justify-center
        backdrop-blur-lg flex-col">
          <div className="flex gap-5 top-0 mb-5">
            <button
              className="bg-black/50 p-3 rounded-full hover:bg-black/50 cursor-pointer
             transition-all duration-300"
            >
              <Download onClick={() => downloadFile(imageURL)} />
            </button>
            <button
              className="bg-black/50 p-3 rounded-full hover:bg-black/50 cursor-pointer
             transition-all duration-300"
            >
              <X onClick={cancelShowImage} />
            </button>
          </div>
          <div className="p-5 md:p-0">
            <img
              src={imageURL}
              alt="Image"
              className="md:h-[80vh] w-full bg-cover"
            />
          </div>
        </div>
      }
    </div>
  )
}
export default MessageContainer