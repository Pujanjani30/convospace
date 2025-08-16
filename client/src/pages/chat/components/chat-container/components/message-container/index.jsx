import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_MESSAGES_ROUTE, HOST } from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import FileDisplay from "./components/FileDisplay.jsx";
import { Download, X } from "lucide-react";

const MessageContainer = () => {
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
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

    if (selectedChatData._id) {
      if (selectedChatType === "dm") getMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  const handleShowImage = (image) => {
    setShowImage(true);
    setImageURL(image);
  }

  const downloadFile = async (fileUrl) => {
    const response = await apiClient.get(`${HOST}/${fileUrl}`, {
      responseType: "blob",
    })

    const urlBlob = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", fileUrl.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
  }

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
                {showDate && <div className="text-center text-gray-500">
                  {moment(message.timestamp).format("LL")}
                </div>}
                {
                  selectedChatType === "dm" ? renderDMMessage(message) : null
                }
              </motion.div>
            )
          })
        }
      </AnimatePresence>
    )
  }

  const renderDMMessage = (message) => {
    return (
      <div className={`${message.sender === selectedChatData._id ? "text-left" : "text-right"}`}>

        {
          message.messageType === "text" && (
            <div
              className={`
                ${message.sender !== selectedChatData._id
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-gray-900 mr-auto"
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
                ${message.sender !== selectedChatData._id
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-gray-900 mr-auto"
                } 
                inline-block p-1 rounded-xl my-1.5 max-w-[75%] shadow-sm`}
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
          <div>
            <img
              src={`${HOST}/${imageURL}`}
              alt="Image"
              className="h-[80vh] w-full bg-cover"
            />
          </div>
        </div>
      }
    </div>
  )
}
export default MessageContainer