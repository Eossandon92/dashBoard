import { SignIn2 } from "../../components/ui/clean-minimal-sign-in"
import { useNavigate } from "react-router-dom"
import axios from "axios"


const backendUrl = import.meta.env.VITE_BACKEND_URL
const Signin = () => {
    const navigate = useNavigate()

    const handleLogin = async ({ email, password }) => {
        try {
            const res = await axios.post(
                `${backendUrl}/api/login`,
                { email, password }
            )

            localStorage.setItem("token", res.data.access_token)
            navigate("/dashboard")
        } catch (err) {
            throw new Error(
                err.response?.data?.message || "Invalid credentials"
            )
        }
    }

    return <SignIn2 onSubmit={handleLogin} />
}

export default Signin
