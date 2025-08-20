// React
import { useEffect, useState } from "react";

// UI Components
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselector";
import { toast } from "sonner";

// Lib
import apiClient from "@/lib/api-client";

// Utils
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store";

const CreateNewChannel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setselectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");

  const { setSelectedChatType, setSelectedChatData, addChannel } = useAppStore();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await apiClient.get(GET_ALL_CONTACTS_ROUTE, {
          withCredentials: true
        })

        if (response.status === 200 && response.data) {
          setContacts(response.data?.data);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    }
    getContacts();
  }, []);

  const createChannel = async () => {
    try {
      if (channelName.trim() === "") {
        toast.error("Please provide a channel name.");
        return;
      }

      if (selectedContacts.length === 0) {
        toast.error("Please select at least one contact.");
        return;
      }

      const response = await apiClient.post(CREATE_CHANNEL_ROUTE, {
        name: channelName,
        members: selectedContacts.map(contact => contact.value)
      },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data) {
        setChannelName("");
        setselectedContacts([]);
        setIsModalOpen(false);
        addChannel(response.data?.data);
        setSelectedChatType("channel");
        setSelectedChatData(response.data?.data);
      }
    } catch (error) {
      console.error("Error creating channel:", error);
      toast.error("Failed to create channel");
    }
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
          <p>Create New Channel</p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Search New Contact</DialogTitle>
            <DialogDescription>
              Please fill up the details below to create a new channel.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              type="text"
              placeholder="Channel Name"
              className="p-5 bg-[#2c2e3b] border-none"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>
          <div>
            <MultipleSelector
              className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
              defaultOptions={contacts}
              placeholder="Select Contacts"
              value={selectedContacts}
              onChange={setselectedContacts}
              emptyIndicator={<p className="text-white">No contacts found</p>}
            />
          </div>
          <div>
            <Button
              className="w-full bg-blue-700 hover:bg-blue-800 transition-all duration-300"
              onClick={createChannel}
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreateNewChannel;