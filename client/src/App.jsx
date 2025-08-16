import { useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Auth from "./pages/auth"
import Chat from "./pages/chat"
import Profile from "./pages/profile"

import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "./components/ui/shadcn-io/spinner"

import { useAppStore } from "./store"

import apiClient from "./lib/api-client"

import { GET_USER_INFO_ROUTE } from "./utils/constants"

const ProtectedRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  return userInfo ? children : <Navigate to="/auth" />;
}

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  return !userInfo ? children : <Navigate to="/chat" />;
}

function App() {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO_ROUTE, {
          withCredentials: true
        })

        response.status === 200
          ? setUserInfo(response?.data?.data)
          : setUserInfo(null);
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    }

    !userInfo ? fetchUserInfo() : setLoading(false);
  }, [userInfo, setUserInfo]);

  if (loading)
    return <div className="flex items-center justify-center h-screen bg-[#1b1c24]">
      <Spinner variant="bars" className="text-white" size={40} />
    </div>;

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        closeButton
        position="top-center"
        // richColors
        expand={true}
      />
    </>

  )
}

export default App