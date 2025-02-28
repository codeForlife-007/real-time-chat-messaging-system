import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const signUpUser = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/user/create`, formData);
        return response.data;
    } catch (err) {
        throw err.response?.data || { general: "Something went wrong." };
    }
}