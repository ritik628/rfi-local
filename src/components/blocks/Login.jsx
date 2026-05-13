"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Mocking next-auth for UI-only demonstration as requested
const signIn = async (provider, options) => {
  console.log(`Signing in with ${provider}`, options);
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

import SobhaLogo from "@/components/ui/SobhaLogo";

function LoginErrorHandler({ setLoginError }) {
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const err = searchParams?.get('error');
    if (err === 'access_denied') {
      setLoginError('Access denied. Please contact your administrator.');
    } else if (err === 'session_expired') {
      setLoginError('Your session has expired. Please sign in again.');
    }
  }, [searchParams, setLoginError]);

  return null;
}

const Login = ({
  heading = "Login",
  logo,
}) => {
  const router = useRouter();
  const [loginError, setLoginError] = React.useState(null);
  const [loadingMode, setLoadingMode] = React.useState(null);
  const isLoading = loadingMode !== null;

  const handleMicrosoftSignIn = () => {
    setLoadingMode("microsoft");
    setLoginError(null);
    setTimeout(async () => {
      try {
        // In a real scenario, this would be: await signIn("azure-ad", { callbackUrl: "/projects" });
        // For UI only, we just redirect to projects
        router.push("/projects");
      } catch {
        setLoginError('Failed to initiate sign in. Please try again.');
        setLoadingMode(null);
      }
    }, 1500);
  };

  return (
    <section className="min-h-[100dvh] relative overflow-hidden" style={{ fontFamily: 'var(--font-sans)' }}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://sobharealty.com/sites/default/files/styles/webp/public/2025-10/A%2812new%29.png.webp?itok=bzo1v0da)'
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center px-4 py-12">
        <React.Suspense fallback={null}>
          <LoginErrorHandler setLoginError={setLoginError} />
        </React.Suspense>

        <div className="w-full max-w-[520px] flex flex-col items-center">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-10 transform scale-150">
              <SobhaLogo size={48} />
            </div>
            {heading && (
              <h1 className="text-center text-[24px] md:text-[32px] leading-tight font-semibold tracking-[-0.01em] mt-4 text-white">
                {heading}
              </h1>
            )}
          </div>

          <div
            className="w-full rounded-2xl p-6 md:p-8 "
            style={{
              border: '1px solid hsla(0, 0%, 100%, 0.10)',
              backdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <h2 className="text-center text-lg font-medium text-white/90 mb-6">
              Sign in to continue
            </h2>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 mb-5">
                <p className="text-[13px] text-red-200">{loginError}</p>
              </div>
            )}

            <Button
              type="button"
              variant="default"
              className="w-full h-[52px] rounded-xl text-[15px] font-medium bg-white hover:bg-gray-100 text-black shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleMicrosoftSignIn}
              disabled={isLoading}
            >
              {loadingMode === "microsoft" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg
                    aria-hidden="true"
                    className="mr-3 h-5 w-5"
                    viewBox="0 0 23 23"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="10" height="10" x="0" y="0" fill="#F35325" />
                    <rect width="10" height="10" x="12.5" y="0" fill="#81BC06" />
                    <rect width="10" height="10" x="0" y="12.5" fill="#05A6F0" />
                    <rect width="10" height="10" x="12.5" y="12.5" fill="#FFBA08" />
                  </svg>
                  Sign in with Microsoft
                </>
              )}
            </Button>
          </div>

          <p className="mt-6 text-center text-[13px] text-white/40">
            Contact your IT admin if you have issues signing in
          </p>

          <div className="flex items-center gap-2 mt-4 text-white/30 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secured by Microsoft Entra ID</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Login };
