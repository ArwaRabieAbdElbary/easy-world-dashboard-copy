import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../services/api";

const ForgetPassword = () => {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: (data) => api.post("/dashboard/admin/sendpasswordreseturl", data),
    onSuccess: () => setSent(true),
    onError: (error) => console.log(error),
  });

  const { isPending: loading, error } = mutation;
  
  const onSubmit = (data) => {
  const payload = {
    email: data.email,
    restLink: `${window.location.origin}/reset-password`,
  };

  mutation.mutate(payload);
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-135">

        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-between w-[45%] bg-primary-500 p-10 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-white/10 rounded-full" />

          {/* brand */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-extrabold text-primary-500 text-lg shadow">
              E
            </div>
            <span className="text-white text-lg font-bold tracking-wide">Easy World</span>
          </div>

          {/* copy */}
          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Forgot your<br />
              <span className="relative inline-block">
                password?
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8"
                  preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 6 Q50 0 100 4 Q150 8 200 2" stroke="white"
                    strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              No worries! Enter your email and we'll send you a reset link right away.
            </p>
          </div>

          {/* icon illustration */}
          <div className="relative z-10 flex justify-center mt-6">
            <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 px-10 py-12 md:px-14 flex flex-col justify-center">

          {/* logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center font-extrabold text-white text-lg shadow">
                E
              </div>
              <span className="text-gray-800 text-lg font-bold tracking-wide">Easy World</span>
            </div>
          </div>

          {!sent ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Forgot Password</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <input
                    type="text"
                    placeholder="Email address"
                    className={`w-full h-12 px-4 rounded-xl border text-sm outline-none transition-all
                      focus:ring-2 focus:ring-primary-300 focus:border-primary-400
                      ${errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email" },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <p className="text-red-600 text-sm">{error?.response?.data?.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold
                    shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="#F6BE00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Check your email</h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                We sent a password reset link to{" "}
                <span className="font-semibold text-gray-700">{getValues("email")}</span>
              </p>
              <button
                onClick={() => mutation.mutate({ email: getValues("email") })}
                disabled={loading}
                className="text-primary-600 text-sm font-medium hover:text-primary-700 transition disabled:opacity-60"
              >
                {loading ? "Resending..." : "Didn't receive it? Resend"}
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-400 mt-8">
            Remember your password?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;