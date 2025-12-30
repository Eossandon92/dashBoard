import * as React from "react"
import { useState } from "react"
import { LogIn, Lock, Mail } from "lucide-react"

const SignIn2 = ({ onSubmit }) => {
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
    <div className="min-h-screen w-full flex items-center justify-center bg-white rounded-xl z-1">
      <div className="w-full max-w-sm bg-gradient-to-b from-sky-50/50 to-white rounded-3xl shadow-xl p-8 flex flex-col items-center border border-blue-100 text-black">

        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-6 shadow-lg">
          <LogIn className="w-7 h-7 text-black" />
        </div>

        <h2 className="text-2xl font-semibold mb-2 text-center">
          Sign in with email
        </h2>

        <p className="text-gray-500 text-sm mb-6 text-center">
          Make a new doc to bring your words, data, and teams together. For free
        </p>

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

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-gradient-to-b from-gray-700 to-gray-900 text-white font-medium py-2 rounded-xl shadow hover:brightness-105 transition mt-4 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Iniciar sesión"}
        </button>
      </div>
    </div>
  )
}

export { SignIn2 }
