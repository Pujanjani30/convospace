// React
import { useEffect, useRef, useState } from "react";

// UI Components
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import Lottie from "react-lottie"

// Lib
import apiClient from "@/lib/api-client";
import { animationDefaultOptions, getColor } from "@/lib/utils"

// Utils
import { HOST, SEARCH_CONTACTS_ROUTE } from "@/utils/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";


const NewDM = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null);

  const { setSelectedChatType, setSelectedChatData } = useAppStore();

  const searchContacts = async (query) => {
    // setSearchQuery(query);
    try {
      if (query.length > 0) {
        const res = await apiClient.post(SEARCH_CONTACTS_ROUTE,
          { query },
          { withCredentials: true }
        );

        if (res.status === 200) {
          setSearchResults(res?.data?.data);
        }
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching contacts:", error);
      setSearchResults([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.trim();
    setSearchQuery(value);

    // Clear the previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set a new timeout
    debounceRef.current = setTimeout(() => {
      searchContacts(value);
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const selectContact = (contact) => {
    setIsModalOpen(false);
    setSelectedChatType("dm");
    setSelectedChatData(contact);
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <Plus
            className="text-neutral-400 font-light text-opacity-90 text-start
          hover:text-neutral-100 cursor-pointer transition-all duration-300"
            onClick={() => setIsModalOpen(true)}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Select New Contact</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={isModalOpen} onOpenChange={() => {
        setIsModalOpen();
        setSearchResults([]);
        setSearchQuery("");
      }}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Search New Contact</DialogTitle>
            <DialogDescription>
              Please select a contact to start a new conversation.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              type="text"
              placeholder="Search for a contact..."
              className="p-5 bg-[#2c2e3b] border-none"
              onChange={handleInputChange}
            />
          </div>
          {
            searchResults.length > 0 ? (
              <ScrollArea className="h-[300px] w-[350px] bg-[#1c1d25] rounded-md p-4">
                {searchResults.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex gap-3 items-center cursor-pointer 
                    hover:bg-[#2c2e3b] p-3 rounded-md transition-all duration-300"
                    onClick={() => selectContact(contact)}
                  >
                    <div className="w-12 h-12 relative">
                      <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                        <AvatarImage
                          src={contact?.profilePic}
                          alt="Profile Pic"
                          className="object-cover w-full h-full"
                        />
                        <AvatarFallback className={`uppercase h-full w-full text-lg border-[1px] flex items-center justify-center 
                          ${getColor(contact?.profileColor)}`}>
                          {contact?.firstName
                            ? contact?.firstName.charAt(0)
                            : contact?.email?.charAt(0)
                          }
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col">
                      <span>
                        {
                          contact.firstName && contact.lastName
                            ? `${contact.firstName + " " + contact.lastName}`
                            : `${contact.email}`
                        }
                      </span>
                      <span className="text-xs text-neutral-400">
                        {contact.email}
                      </span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            ) : (
              searchQuery.length > 0 ? (
                <div className="bg-[#1c1d25] text-neutral-400 flex flex-1 flex-col justify-center items-center">
                  No contacts found
                </div>
              ) : (
                <div className="bg-[#1c1d25] flex flex-1 flex-col justify-center items-center">
                  <Lottie
                    isClickToPauseDisabled={true}
                    height={100}
                    width={100}
                    options={animationDefaultOptions}
                  />
                </div>
              )
            )
          }
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NewDM;