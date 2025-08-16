// React
import { useState } from "react";
import { useNavigate } from "react-router-dom"

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Assets
import SideImage from "@/assets/login2.png";
import Victory from "@/assets/victory.svg";

//lib
import apiClient from "@/lib/api-client";

// utils
import { validateForm } from "@/utils/validation";
import { SIGNUP_ROUTE, LOGIN_ROUTE } from "@/utils/constants.js";
import { useAppStore } from "@/store";
import { AlertCircle } from "lucide-react";

const Auth = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  })

  const { setUserInfo } = useAppStore()

  const navigate = useNavigate();

  const [signupValidationErrors, setSignupValidationErrors] = useState({});

  const [loginValidationErrors, setLoginValidationErrors] = useState({});

  const signupValidationRules = {
    email: {
      required: { value: true },
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
    },
    password: {
      required: { value: true },
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/,
        message: "Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      }
    },
    confirmPassword: {
      required: { value: true },
      validate: (value, formData) => {
        return value === formData.password || "Passwords do not match";
      }
    },
  }

  const loginValidationRules = {
    email: {
      required: { value: true },
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      }
    },
    password: {
      required: { value: true }
    },
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSignup = async (e) => {
    e.preventDefault();

    const errors = validateForm(formData, signupValidationRules);

    if (Object.keys(errors).length > 0) {
      setSignupValidationErrors(errors);
      return;
    }

    // API call
    try {
      const response = await apiClient.post(SIGNUP_ROUTE, {
        email: formData.email,
        password: formData.password
      }, { withCredentials: true });

      if (response.status === 200) {
        toast.success("Signup successful!");
        setUserInfo(response?.data?.data);
        navigate("/profile", { replace: true });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Signup failed. Please try again.");
      return;
    }

    setSignupValidationErrors({});
    setFormData({ email: "", password: "", confirmPassword: "" });
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    const errors = validateForm(formData, loginValidationRules);

    if (Object.keys(errors).length > 0) {
      setLoginValidationErrors(errors);
      return;
    }

    // API call
    try {
      const response = await apiClient.post(LOGIN_ROUTE, {
        email: formData.email,
        password: formData.password
      }, { withCredentials: true });

      if (response.status === 200) {
        toast.success("Login successful!");

        setUserInfo(response?.data?.data);

        response?.data?.data?.profileSetupStatus
          ? navigate("/chat", { replace: true })
          : navigate("/profile", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
      return;
    }

    setLoginValidationErrors({});
    setFormData({ email: "", password: "", confirmPassword: "" });
  }

  return (
    <div className="h-screen w-[100vw] flex items-center justify-center">
      <div className="min-h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] 
      md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center py-5 px-2">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">
                Welcome
              </h1>
              <img
                src={Victory}
                alt="Vitory Emoji"
                className="h-[100px]"
              />
            </div>
            <p className="font-medium text-center">
              Fill in the details to get started with the best chat app!
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger value="login"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full
                  data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500
                  p-3 transition-all duration-300 cursor-pointer"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full
                  data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500
                  p-3 transition-all duration-300 cursor-pointer"
                >
                  Signup
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form
                  className="flex flex-col gap-5 mt-5"
                  onSubmit={handleLogin}
                >
                  <div className="flex flex-col gap-2">
                    <Input
                      type="text"
                      name="email"
                      placeholder="Email"
                      className="rounded-full p-6"
                      value={formData.email}
                      onChange={(e) => handleInputChange(e)}
                      autoComplete="off"
                    />
                    {loginValidationErrors.email && (
                      <p className="text-red-400 text-sm ms-3">
                        <AlertCircle className="text-red-400 h-4 w-4 inline-block mr-1" />
                        {loginValidationErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Input
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="rounded-full p-6"
                      value={formData.password}
                      onChange={(e) => handleInputChange(e)}
                      autoComplete="off"
                    />
                    {loginValidationErrors.password && (
                      <p className="text-red-400 text-sm ms-3">
                        <AlertCircle className="text-red-400 h-4 w-4 inline-block mr-1" />
                        {loginValidationErrors.password}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="rounded-full p-6 cursor-pointer"
                  >
                    Login
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form
                  className="flex flex-col gap-5 mt-5"
                  onSubmit={handleSignup}
                >
                  <div className="flex flex-col gap-2">
                    <Input
                      type="text"
                      name="email"
                      placeholder="Email"
                      className="rounded-full p-6"
                      value={formData.email}
                      onChange={(e) => handleInputChange(e)}
                      autoComplete="off"
                    />
                    {signupValidationErrors.email && (
                      <p className="text-red-400 text-sm ms-3">
                        <AlertCircle className="text-red-400 h-4 w-4 inline-block mr-1" />
                        {signupValidationErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Input
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="rounded-full p-6"
                      value={formData.password}
                      onChange={(e) => handleInputChange(e)}
                      autoComplete="off"
                    />
                    {signupValidationErrors.password && (
                      <p className="text-red-400 text-sm ms-3">
                        <AlertCircle className="text-red-400 h-4 w-4 inline-block mr-1 mt-0.5" />
                        {signupValidationErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      className="rounded-full p-6"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange(e)}
                      autoComplete="off"
                    />
                    {signupValidationErrors.confirmPassword && (
                      <p className="text-red-400 text-sm ms-3">
                        <AlertCircle className="text-red-400 h-4 w-4 inline-block mr-1" />
                        {signupValidationErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="rounded-full p-6 cursor-pointer"
                  >
                    Signup
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center ">
          <img
            src={SideImage}
            alt="Side image"
            className="h-[500px]"
          />
        </div>
      </div>
    </div >
  )
}

export default Auth