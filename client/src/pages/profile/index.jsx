// React
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Store
import { useAppStore } from "@/store"

// Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Plus, Trash2 } from "lucide-react";

// Lib
import apiClient from "@/lib/api-client";
import { colors, getColor } from "@/lib/utils";

// Utils
import { UPDATE_PROFILE_ROUTE, ADD_PROFILE_PIC_ROUTE, HOST, REMOVE_PROFILE_PIC_ROUTE } from "@/utils/constants";
import { validateForm } from "@/utils/validation";

const Profile = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    profilePic: null,
    profileColor: 0
  });
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo.profileSetupStatus) {
      setProfileData({
        firstName: userInfo?.firstName,
        lastName: userInfo?.lastName,
        profileColor: userInfo?.profileColor
      });
    }

    if (userInfo?.profilePic) {
      setProfileData(prev => ({
        ...prev,
        profilePic: userInfo.profilePic
      }));
    }
  }, [userInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  }

  const validationRules = {
    firstName: {
      required: { value: true },
      minLength: { value: 2, message: "First name must be at least 2 characters long" },
    },
    lastName: {
      required: { value: true },
      minLength: { value: 2, message: "Last name must be at least 2 characters long" }
    }
  }

  const saveChanges = async () => {
    try {
      const errors = validateForm(profileData, validationRules);

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }

      const response = await apiClient.put(UPDATE_PROFILE_ROUTE, profileData, {
        withCredentials: true
      });

      if (response.status === 200) {
        setUserInfo(response.data.data);
        toast.success("Profile updated successfully!");
        navigate("/chat");
      }
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  const handleBackClick = () => {
    userInfo.profileSetupStatus
      ? navigate("/chat")
      : toast.warning("Please complete your profile setup first.");
  }

  const handleProfilePicClick = () => {
    fileInputRef.current.click();
  }

  const handleImageChange = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    const formData = new FormData();
    formData.append("profilePic", image);

    setLoading(true);
    try {
      const response = await apiClient.post(ADD_PROFILE_PIC_ROUTE, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.status === 200) {
        setUserInfo({ ...userInfo, profilePic: response.data.data.profilePic });
        toast.success("Profile picture updated successfully!");
      }

      const reader = new FileReader();
      reader.onload = () => {
        setProfileData(prev => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(image);

    } catch (error) {
      toast.error("Failed to update profile picture.");
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteImage = async () => {
    setLoading(true);
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_PIC_ROUTE, {
        withCredentials: true
      });

      if (response.status === 200) {
        setUserInfo({ ...userInfo, profilePic: null });
        setProfileData(prev => ({ ...prev, profilePic: null }));
        toast.success("Profile picture deleted successfully!");
      }

      setProfileData(prev => ({ ...prev, profilePic: null }));

    } catch (error) {
      toast.error("Failed to delete profile picture.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#1b1c24] h-screen flex flex-col items-center justify-center gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div className="flex w-full items-center justify-between">
          <ArrowLeft
            className="text-4xl lg:text-6xl text-white/90 cursor-pointer"
            onClick={handleBackClick}
          />
          <h2 className="text-2xl lg:text-4xl text-white/90 font-semibold">
            Profile
          </h2>
        </div>
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col gap-8 justify-center items-center mb-10 md:mb-0">
            <div className="h-28 w-28 md:w-32 md:h-32 flex items-center justify-center relative"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <Avatar className="h-full w-full rounded-full overflow-hidden cursor-pointer">
                <AvatarImage
                  src={profileData?.profilePic || null}
                  alt="Profile Pic"
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className={`uppercase text-5xl border-[1px] flex items-center justify-center 
                ${getColor(profileData?.profileColor)}`}>
                  {profileData?.firstName
                    ? profileData?.firstName.charAt(0)
                    : userInfo?.email?.charAt(0)
                  }
                </AvatarFallback>
              </Avatar>

              {hovered && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/50 
                rounded-full cursor-pointer"
                  onClick={profileData?.profilePic ? handleDeleteImage : handleProfilePicClick}
                >
                  {profileData?.profilePic
                    ? <Trash2 className="text-white h-10 w-10" />
                    : <Plus className="text-white h-10 w-10" />
                  }
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                name="profilePic"
                accept=".jpg, .jpeg, .png, .svg, .webp"
              />
            </div>
            <div className="w-full flex gap-5 justify-center items-center">
              {
                colors.map((color, index) => (
                  <div key={index}
                    className={
                      `${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300
                       ${parseInt(profileData?.profileColor) === index ? "ring-2 ring-white" : ""}
                    `}
                    onClick={() => setProfileData(prev => ({ ...prev, profileColor: index }))}
                  >
                  </div>
                ))
              }
            </div>
          </div>

          <div
            className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center 
            justify-center"
          >
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                value={userInfo?.email || ""}
                disabled
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="First Name *"
                type="text"
                name="firstName"
                value={profileData?.firstName || ""}
                onChange={handleInputChange}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                autoComplete="off"
              />
              {errors.firstName && (
                <div className="flex items-center mt-1">
                  <AlertCircle className="text-red-400 h-4 w-4 inline-block mr-1 mt-0.5" />
                  <p className="text-red-400 text-sm">
                    {errors.firstName}
                  </p>
                </div>
              )}
            </div>
            <div className="w-full">
              <Input
                placeholder="Last Name *"
                type="text"
                name="lastName"
                value={profileData?.lastName || ""}
                onChange={handleInputChange}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                autoComplete="off"
              />
              {errors.lastName && (
                <div className="flex items-center mt-1">
                  <AlertCircle className="text-red-400 h-4 w-4 inline-block mr-1 mt-0.5" />
                  <p className="text-red-400 text-sm">
                    {errors.lastName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full">
          <Button
            className="w-full py-6 bg-blue-700 hover:bg-blue-800
          transition-all duration-300 cursor-pointer text-md"
            onClick={saveChanges}
            disabled={loading || !profileData?.firstName || !profileData?.lastName}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div >
  )
}

export default Profile