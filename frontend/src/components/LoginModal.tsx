import React, { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogin?: (token: string) => void;
}

const LoginModal: React.FC<Props> = ({
  open,
  onClose,
  onLogin,
}) => {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        await axios.post(`${API}/register`, {
          name,
          email,
          password,
        });

        alert("Registration successful! Please login.");

        setIsRegister(false);
        setPassword("");
      } else {
        const res = await axios.post(`${API}/login`, {
          email,
          password,
        });

        const token = res.data.token;

        localStorage.setItem("aura_token", token);

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        if (onLogin) {
          onLogin(token);
        }

        onClose();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-dark-900 border border-white/10 p-6">

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isRegister ? "Create Account" : "Login"}
        </h2>

        {isRegister && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full mb-3 p-3 rounded bg-white/5 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 rounded bg-white/5 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded bg-white/5 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 mb-3">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-cyan-500 text-black font-semibold"
        >
          {loading
            ? "Please wait..."
            : isRegister
            ? "Register"
            : "Login"}
        </button>

        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
          className="w-full mt-4 text-cyan-400"
        >
          {isRegister
            ? "Already have an account? Login"
            : "Create a new account"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 text-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginModal; 