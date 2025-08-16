// React
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppStore } from "@/store"

// UI Components
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit, LogOut } from "lucide-react"
import { toast } from "sonner"

// Lib
import { getColor } from "@/lib/utils"
import apiClient from "@/lib/api-client"

// Utils
import { HOST, LOGOUT_ROUTE } from "@/utils/constants"

const ProfileInfo = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await apiClient.delete(LOGOUT_ROUTE, {
        withCredentials: true
      })

      if (response.status === 200) {
        navigate("/auth");
        setUserInfo(null);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Something went wrong.")
    }
  }

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-5 w-full bg-[#2a2b33] ">
      <div className="flex gap-3 items-center justify-center">
        <div className="w-12 h-12 relative">
          <Avatar className="h-12 w-12 rounded-full overflow-hidden">
            <AvatarImage
              src={`${HOST}/${userInfo?.profilePic}`}
              alt="Profile Pic"
              className="object-cover w-full h-full"
            />
            <AvatarFallback className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center 
            ${getColor(userInfo?.profileColor)}`}>
              {userInfo?.firstName
                ? userInfo?.firstName.charAt(0)
                : userInfo?.email?.charAt(0)
              }
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-lg">
          {
            userInfo.firstName && userInfo.lastName
              ? `${userInfo.firstName + " " + userInfo.lastName}`
              : ""
          }
        </div>
      </div>
      <div className="flex gap-5">
        <Tooltip>
          <TooltipTrigger>
            <Edit
              className="text-blue-500 cursor-pointer " size={22}
              onClick={() => navigate('/profile')}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Profile</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <LogOut className="text-red-500 cursor-pointer" size={22} onClick={() => setIsDialogOpen(true)} />
          </TooltipTrigger>
          <TooltipContent>
            <p>Logout</p>
          </TooltipContent>
        </Tooltip>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-[#1b1c24] text-white border-none">
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to log out?</p>
            <DialogFooter>
              <DialogClose>
                <Button
                  type="button"
                  variant="outline"
                  className="text-white bg-[#2a2b33]"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                className=" "
                onClick={handleLogout}
              >
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
export default ProfileInfo