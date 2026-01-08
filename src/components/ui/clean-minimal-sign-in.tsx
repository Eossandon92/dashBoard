import * as React from "react"
import { useState } from "react"
import { LogIn, Lock, Mail } from "lucide-react"
import { Button } from "./button"

const SignIn2 = ({ onSubmit, className, style }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setError("")
    setLoading(true)

    try {
      await onSubmit({ email, password })
    } catch (err) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen w-full flex items-center justify-center bg-white rounded-xl z-1 ${className || ''}`} style={style}>
      <div className="w-full max-w-sm bg-gradient-to-b from-sky-50/50 to-white rounded-3xl shadow-xl p-8 flex flex-col items-center border border-blue-100 text-black">
        <div className="mb-2">
          <img src="https://res.cloudinary.com/dnkalrt1u/image/upload/v1767886622/logo_gestora_signin_hcknws.png" alt="" />
        </div>


        <p className="text-gray-500 text-sm mb-6 text-center">
          Gestora reúne la administración, la información y los equipos de tu condominio en un solo lugar.”        </p>

        <div className="w-full flex flex-col gap-3 mb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-200 bg-gray-50 text-sm"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-200 bg-gray-50 text-sm"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}
        </div>

        <Button
          onClick={handleSignIn}
          disabled={loading}
          className="
                  w-full
                  bg-gradient-to-b from-gray-800 to-gray-950
                  text-white font-semibold
                  py-2.5
                  !rounded-full
                  shadow-lg shadow-black/30
                  hover:brightness-110 hover:shadow-xl
                  active:scale-[0.98] 
                  transition-all duration-200
                  mt-4
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </div>
    </div>
  )
}

export { SignIn2 }
