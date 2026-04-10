import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const register = useAppStore((s) => s.register);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-forge-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forge-textPrimary tracking-tight">
            LazyOwl<span className="text-forge-accent">.</span>
          </h1>
          <p className="text-forge-textSecondary mt-2">
            Create your account and start learning.
          </p>
        </div>

        {/* Card */}
        <div className="bg-forge-surface border border-forge-border rounded-3xl p-8 shadow-brand">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-forge-accent/10">
              <UserPlus size={22} className="text-forge-accent" />
            </div>
            <h2 className="text-xl font-bold text-forge-textPrimary">
              Create Account
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-forge-danger/10 border border-forge-danger/20 text-forge-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-forge-textSecondary mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-forge-textSecondary"
                />
                <input
                  id="register-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-forge-bg border border-forge-border text-forge-textPrimary placeholder:text-forge-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-forge-accent/50 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-forge-textSecondary mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-forge-textSecondary"
                />
                <input
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-forge-bg border border-forge-border text-forge-textPrimary placeholder:text-forge-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-forge-accent/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-forge-textSecondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-forge-textSecondary"
                />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-12 py-3 rounded-2xl bg-forge-bg border border-forge-border text-forge-textPrimary placeholder:text-forge-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-forge-accent/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forge-textSecondary hover:text-forge-textPrimary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-forge-textSecondary mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-forge-textSecondary"
                />
                <input
                  id="register-confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-forge-bg border border-forge-border text-forge-textPrimary placeholder:text-forge-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-forge-accent/50 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-forge-accent text-white font-semibold hover:bg-forge-accentHover focus:ring-2 focus:ring-forge-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-forge-textSecondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-forge-accent font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
