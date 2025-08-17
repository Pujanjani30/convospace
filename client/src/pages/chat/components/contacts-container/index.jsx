import { useEffect } from "react";
import Logo from "@/assets/convospace_logo.png"
import ProfileInfo from "./components/profile-info";
import NewDM from "./components/new-dm";
import apiClient from "@/lib/api-client";
import { GET_DM_CONTACTS_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "./components/contact-list";

const ContactsContainer = () => {
  const { setDmContacts, dmContacts } = useAppStore();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const res = await apiClient.get(GET_DM_CONTACTS_ROUTE, {
          withCredentials: true
        })

        if (res.data.data) {
          setDmContacts(res.data.data);
        }
      } catch (error) {
        console.log("Error fetching DM contacts:", error);
        toast.error("Failed to fetch DM contacts");
      }
    }

    getContacts();
  }, [])


  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-3 flex p-5 justify-start items-center gap-2">
        <img
          src={Logo}
          alt="Logo"
          height={60}
          width={60} />
        <span className="text-3xl font-semibold ">ConvoSpace</span>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between px-5">
          <Title text={"Direct Messages"} />
          <NewDM />
        </div>
        <div className="max-h-52 overflow-y-auto scrollbar-hidden">
          <ContactList contacts={dmContacts} />
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between px-5">
          <Title text={"Channels"} />
        </div>
      </div>
      <ProfileInfo />
    </div>
  )
}
export default ContactsContainer;

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400 font-light text-opacity-90 text-sm">
      {text}
    </h6>
  )
}