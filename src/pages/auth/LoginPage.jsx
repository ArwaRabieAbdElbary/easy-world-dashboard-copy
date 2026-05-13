import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../services/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const loginMutation = useMutation({
    mutationFn: (data) => api.post("/dashboard/admin/login", data),

    onSuccess: (response) => {
      const accessToken = response?.data?.data?.accessToken;
      const refreshToken = response?.data?.data?.refreshToken;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      navigate("/dashboard");
    },

    onError: (error) => {
      console.log("Full error:", error);
      console.log("Response data:", error?.response?.data);
    },
  });

  const { isPending: loading, error } = loginMutation;
  const onSubmit = (data) => loginMutation.mutate(data);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-135">
        {/* LEFT — orange panel */}
        <div className="hidden md:flex flex-col justify-between w-[45%] bg-primary-500 p-10 relative overflow-hidden">
          {/* decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-white/10 rounded-full" />

          {/* brand */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-extrabold text-primary-500 text-lg shadow">
              E
            </div>
            <span className="text-white text-lg font-bold tracking-wide">
              Easy World
            </span>
          </div>

          {/* main copy */}
          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Simplify
              <br />
              management
              <br />
              with our{" "}
              <span className="relative inline-block">
                dashboard.
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 6 Q50 0 100 4 Q150 8 200 2"
                    stroke="white"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              Simplify your e-commerce management with our user-friendly admin
              dashboard.
            </p>
          </div>

          {/* illustration placeholder — swap with your own image if available */}
          <div className="relative z-10 flex justify-center mt-6">
            <div className="w-48 h-36 flex items-end justify-center gap-4 opacity-80">
              {/* simple silhouette shapes */}
              <div className="w-16 h-28 bg-white/20 rounded-t-full rounded-b-lg" />
              <div className="w-14 h-24 bg-white/20 rounded-t-full rounded-b-lg" />
            </div>
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div className="flex-1 px-10 py-12 md:px-14 flex flex-col justify-center">
          {/* logo (shown on mobile too) */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center font-extrabold text-white text-lg shadow">
                E
              </div>
              <span className="text-gray-800 text-lg font-bold tracking-wide">
                Easy World
              </span>
            </div>
          </div>

          {/* heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Please login to your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* email */}
            <div>
              <input
                type="text"
                placeholder="Email address"
                className={`w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all
                  focus:ring-2 focus:ring-primary-300 focus:border-primary-400
                  ${
                    errors.emailOrPhone
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                {...register("emailOrPhone", {
                  required: "Email or phone is required",
                })}
              />
              {errors.emailOrPhone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.emailOrPhone.message}
                </p>
              )}
            </div>

            {/* password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={`w-full h-12 px-4 pr-12 rounded-xl border text-sm outline-none transition-all
                    focus:ring-2 focus:ring-primary-300 focus:border-primary-400
                    ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* forgot */}
            <div className="flex justify-end -mt-1">
              <Link
                to="/forget-password"
                className="text-xs text-gray-500 hover:text-primary-600 transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* api error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">
                {error?.response?.data?.message || 
                error?.response?.data?.error ||
                error?.message ||
                "Invalid email or password. Please try again."}
              </p>
            </div>
          )}

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold
                shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">Or Login with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* social buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 h-11 flex items-center justify-center gap-2 border border-gray-200 rounded-xl
                text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              {/* Google icon */}
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex-1 h-11 flex items-center justify-center gap-2 border border-gray-200 rounded-xl
                text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              {/* Facebook icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          {/* footer */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
