import { SignIn2 } from "../../components/ui/clean-minimal-sign-in"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"

const backendUrl = import.meta.env.VITE_BACKEND_URL

const Signin = () => {
    const navigate = useNavigate()
    const { setUser } = useAuth()

    const handleLogin = async ({ email, password }) => {
        try {
            const res = await axios.post(
                `${backendUrl}/api/login`,
                { email, password }
            )

            const { access_token, user } = res.data

            localStorage.setItem("token", access_token)

            const authUser = {
                id: user.id,
                email: user.email,
                condominium_id: user.condominium_id,
                roles: user.roles,
            }

            setUser(authUser)
            localStorage.setItem("authUser", JSON.stringify(authUser))

            navigate("/app")
        } catch (err) {
            throw new Error(
                err.response?.data?.message || "Invalid credentials"
            )
        }
    }

    return <SignIn2 onSubmit={handleLogin} />
}

export default Signin
