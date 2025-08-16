import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store"
import { HOST } from "@/utils/constants";
import moment from "moment";

const ContactList = ({ contacts, isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
    setDmContacts,
    dmContacts,
    isUserOnline,
    isUserTyping,
  } = useAppStore();

  const handleSelect = (contact) => {
    setSelectedChatData(contact);
    setSelectedChatType(isChannel ? "channel" : "dm");

    const updatedDmContacts = dmContacts.map(c => c._id === contact._id ? { ...c, unseenCount: 0 } : c);

    setDmContacts(updatedDmContacts);

    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  }

  return (
    <div className="mt-5 px-5">
      {
        contacts.map((contact) => {

          const isOnline = !isChannel && isUserOnline(contact._id);
          const isTyping = !isChannel && isUserTyping(contact._id);

          return (
            <div
              key={contact._id}
              className={`py-2 px-2 transition-all duration-300 cursor-pointer rounded-xl mb-1
              ${selectedChatData && selectedChatData._id === contact._id
                  ? "bg-[#1787ff]/50"
                  : "hover:bg-[#f1f1f111]"
                }
              `}
              onClick={() => handleSelect(contact)}
            >
              <div className="flex gap-5 items-center justify-start text-neutral-300">
                {
                  !isChannel && (
                    <div className="relative">
                      <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                        <AvatarImage
                          src={`${HOST}/${contact?.profilePic}`}
                          alt="Profile Pic"
                          className="object-cover w-full h-full"
                        />
                        <AvatarFallback className={`
                    uppercase h-full w-full text-lg border-[1px] flex items-center justify-center
                        ${selectedChatData && selectedChatData._id === contact._id
                            ? `${getColor(contact?.profileColor)} ring-2 ring-white/30 ring-offset-2 ring-offset-[#1787ff]/50 brightness-125 contrast-110`
                            : getColor(contact?.profileColor)
                          }`}>
                          {contact?.firstName
                            ? contact?.firstName.charAt(0)
                            : contact?.email?.charAt(0)
                          }
                        </AvatarFallback>
                      </Avatar>

                      {/* Online status indicator */}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1b1c24] 
                      ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    </div>
                  )
                }
                {
                  isChannel && (
                    <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                      #
                    </div>
                  )
                }
                {
                  isChannel
                    ? <span>{contact.name}</span>
                    :
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-col">
                        <span>{`${contact.firstName} ${contact.lastName}`}</span>

                        {/* Status text with typing indicator */}
                        <div className="text-xs">
                          {isTyping && (
                            <span className="text-blue-400 italic flex items-center gap-1">
                              {/* <div className="flex gap-0.5">
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div> */}
                              Typing...
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unseen count and time */}
                      {contact.unseenCount > 0 && (
                        <div className="flex flex-col justify-center items-center gap-1">
                          <span className="bg-blue-500 text-white rounded-full text-xs px-2 py-0.5 
                        flex justify-center items-center min-w-[20px]">
                            {contact.unseenCount > 99 ? '99+' : contact.unseenCount}
                          </span>
                          {contact.lastMessageTime && (
                            <span className="text-xs text-blue-400">
                              {moment(contact.lastMessageTime).format('HH:mm')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                }
              </div>
            </div>
          )
        })
      }

    </div>
  )
}
export default ContactList