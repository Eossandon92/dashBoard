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

    return (
        <SignIn2
            onSubmit={handleLogin}
            style={{
                // 1. Obligar al contenedor a ocupar toda la pantalla
                width: '100vw',        // 100% del ancho de la VISIÓN (Viewport Width)
                height: '100vh',       // 100% del alto de la VISIÓN (Viewport Height)
                position: 'fixed',     // Fija el fondo para que no se mueva y ignore márgenes de padres
                top: 0,
                left: 0,
                margin: 0,             // Elimina márgenes accidentales
                padding: 0,            // Elimina rellenos accidentales

                // 2. Propiedades de la imagen
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.05)), url("https://res.cloudinary.com/dnkalrt1u/image/upload/v1768250330/modernized_gestora_login_screen_1_mzkchf.png")`,
                backgroundSize: 'cover',   // Mantiene la proporción y cubre todo
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',

                // 3. Para centrar tu cuadro de login (opcional, pero útil)
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        />
    )
}

export default Signin
