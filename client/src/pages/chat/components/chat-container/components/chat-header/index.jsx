import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { X } from "lucide-react"
import moment from "moment";

const ChatHeader = () => {
  const {
    closeChat,
    selectedChatType,
    selectedChatData,
    isUserOnline,
    isUserTyping,
    getUserLastSeen
  } = useAppStore();

  const isOnline = selectedChatData && selectedChatType === "dm" ? isUserOnline(selectedChatData._id) : false;
  const isTyping = selectedChatData && selectedChatType === "dm" ? isUserTyping(selectedChatData._id) : false;
  const userLastSeen = selectedChatData && selectedChatType === "dm" ? getUserLastSeen(selectedChatData._id) : null;

  const getStatusDisplay = () => {
    if (selectedChatType !== "dm" || !selectedChatData) return null;

    if (isTyping) {
      return (
        <div className="flex items-center gap-2">
          {/* <div className="flex gap-0.5">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div> */}
          <span className="text-blue-400 italic text-xs">Typing...</span>
        </div>
      );
    }

    if (isOnline) {
      return <span className="text-blue-400 text-xs">Online</span>;
    }

    if (userLastSeen) {
      return (
        <span className="text-gray-400 text-xs">
          Last seen {moment(userLastSeen).fromNow()}
        </span>
      );
    }

    return <span className="text-gray-400 text-xs">Offline</span>;
  }

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex px-10">
      <div className="flex w-full items-center justify-between">
        <div className="flex gap-3 items-center justify-center">
          <div className="w-12 h-12 relative">
            {selectedChatType === "dm" ? (
              <>
                <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                  <AvatarImage
                    src={`${HOST}/${selectedChatData?.profilePic}`}
                    alt="Profile Pic"
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback className={`uppercase h-full w-full text-lg border-[1px] flex items-center justify-center 
                              ${getColor(selectedChatData?.profileColor)}`}>
                    {selectedChatData?.firstName
                      ? selectedChatData?.firstName.charAt(0)
                      : selectedChatData?.email?.charAt(0)
                    }
                  </AvatarFallback>
                </Avatar>

                {/* Online status indicator */}
                {/* <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1b1c24] 
                ${isOnline ? 'bg-green-500' : 'bg-gray-500'} 
                ${isOnline ? 'animate-pulse' : ''}`}></div> */}
              </>
            ) : (
              // Channel avatar
              <div className="bg-[#ffffff22] h-12 w-12 flex items-center justify-center rounded-full text-2xl">
                #
              </div>
            )}
          </div>
          <div>
            {selectedChatType === "dm" && (
              <div className="flex flex-col justify-center">
                <span>
                  {selectedChatData.firstName && selectedChatData.lastName
                    ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                    : selectedChatData.email
                  }
                </span>
                {getStatusDisplay()}
              </div>
            )}

            {selectedChatType === "channel" && selectedChatData && (
              <div className="flex flex-col justify-center">
                <span className="text-white font-medium">
                  {selectedChatData.name}
                </span>
                <span className="text-gray-400 text-xs">
                  {selectedChatData.members?.length || 0} members
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5">
          <button
            className="text-neutral-500 hover:text-white duration-300 transition-all "
            onClick={closeChat}
          >
            <X size={25} />
          </button>
        </div>
      </div>
    </div>
  )
}
export default ChatHeader