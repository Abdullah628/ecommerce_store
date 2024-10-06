import {create} from "zustand";
import axios from "axios";
import {toast} from "react-hot-toast";

export const useUserStore = create((set) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async({name, email, password, confirmPassword}) => {
        set({ loading: true});

        if(password !== confirmPassword){
            set({loading: false});
            return toast.error("Password do not match");
        }

        try {
            const res = await axios.post("api/auth/signup",{name, email, password});
            set({user: res.data.user , loading:false})

            toast.success("Account created successfully");
        } catch (error) {
            set({loading: false});
            return toast.error(error.response.data.message || "An error occurred");
        }
    },

    login: async(email, password) => {
        set({ loading: true});

        try {
            const res = await axios.post("api/auth/login",{email, password});
            set({user: res.data , loading:false})
            toast.success("Login successful");
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.message || "An error occurred");
        }
    },

    checkAuth: async() =>{
        set({checkingAuth: true});
        try {
            const res = axios.get("api/auth/profile");
            set({user: res.data, checkingAuth: false})
            console.log(res.data);
        } catch (error) {
            set({checkingAuth: false, user: null})
            toast.error(error.response.data.message || "An error occurred");
        }
    }

}))