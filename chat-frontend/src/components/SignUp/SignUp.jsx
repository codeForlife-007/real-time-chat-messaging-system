import { useState } from "react";
import chatImage from '../../assets/chat.png';
import styles from './SignUp.module.css';
import { useNavigate } from "react-router-dom";
import { signUpUser } from "../../service./apiService";

function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNo: ''
    });
    const [errors, setErrors] = useState({}); 
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "name is required";
        if (!formData.email) newErrors.email = "email is required"; 
        if (!formData.phoneNo) { 
            newErrors.phoneNo = "Phone no is required"; 
        } else if (!/^\+?\d{1,3}[1-9]\d{7,13}$/.test(formData.phoneNo)) {
            newErrors.phoneNo = "Phone no must be 10 digits"
        }
        return newErrors;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            const response = await signUpUser(formData); 
            console.log("Data saved successfully: ", response);
            setErrors({});
            const userId = response.id;
            navigate('/chat', { state: { userId } });
        } catch (err) {
            console.error("Error saving data: ", err.response?.data || err.message);
            if (err.response && (err.response.status === 400) || (err.response.status === 409)) {
                setErrors({ credentials: "Wrong credentials" });
            } else {
                setErrors(err.response?.data || { general: "Something went wrong" });   
            }
        }
    };

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <img src={chatImage} alt="Chat-image" className={styles.chatImage}/>
                <form className="form" onSubmit={handleSubmit}>
                    <div>
                        <input type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name"
                            className={styles.input}
                            style={{ borderColor: errors.name ? 'red' : '#ccc' }}
                        />
                    </div>

                    <div>
                        <input type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className={styles.input}
                            style={{ borderColor: errors.email ? 'red' : '#ccc' }}
                        />
                    </div>

                    <div>
                        <input type="text"
                            name="phoneNo"
                            value={formData.phoneNo}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className={styles.input}
                            style={{ borderColor: errors.phoneNo ? 'red' : '#ccc' }}
                        />
                    </div>
                    { errors.credentials && <p style={{ color: 'red' }}>{errors.credentials}</p>}
                    { errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
                    <button type="submit" className={styles.button}>Sign Up</button>
                </form>
            </div>
        </div>
    )
}

export default SignUp;