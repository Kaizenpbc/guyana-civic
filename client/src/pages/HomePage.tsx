import { useQuery } from "@tanstack/react-query";
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { MessageSquare, MapPin, Users, Mail, Flag, ChevronRight } from "lucide-react";

const getCurrentUser = async (): Promise<{ user: any }> => {
  const response = await fetch('/api/auth/me');
  if (!response.ok) throw new Error('Not authenticated');
  return response.json();
};

export default function HomePage() {
  const [, navigate] = useLocation();

  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    retry: false,
  });

  // Role-based routing for logged-in users
  useEffect(() => {
    if (!authLoading && authData?.user) {
      const role = authData.user.role;
      switch (role) {
        case 'pm': navigate('/pm/dashboard'); break;
        case 'rdc_manager': navigate('/rdc/dashboard'); break;
        case 'minister': navigate('/ministerial/dashboard'); break;
        case 'admin':
        case 'super_admin': navigate('/admin/dashboard'); break;
        case 'staff': navigate('/staff/dashboard'); break;
      }
    }
  }, [authData, authLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <GuyanaFlag />
              <span className="text-lg font-bold text-gray-900">Guyana Citizen Engagement</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="/" className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
                <Flag className="h-4 w-4" />
                Home
              </a>
              <a href="#ideas" className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                <MessageSquare className="h-4 w-4" />
                Share Ideas
              </a>
              <a href="#issues" className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                <MapPin className="h-4 w-4" />
                Report Issues
              </a>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm"
              >
                REO Login
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 text-sm transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600 py-20 md:py-28">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-emerald-600 rounded-2xl p-4 shadow-lg">
              <GuyanaFlag size={64} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Guyana Citizen Engagement
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Share your ideas for government implementation and report community
            issues. Your voice matters in building a better Guyana.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/rdc/region-2')}
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-8 py-3 rounded-lg
                         transition-colors flex items-center gap-2 text-lg shadow-md"
            >
              Share Ideas
            </button>
            <button
              onClick={() => navigate('/rdc/region-2')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-lg
                         border border-white/30 transition-colors flex items-center gap-2 text-lg"
            >
              <MapPin className="h-5 w-5" />
              Report Issues
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-100 rounded-full p-4">
                  <MessageSquare className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Share Ideas</h3>
              <p className="text-gray-600 text-sm">
                Submit proposals for government implementation
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-100 rounded-full p-4">
                  <MapPin className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Report Issues</h3>
              <p className="text-gray-600 text-sm">
                Report community problems to your REO
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-100 rounded-full p-4">
                  <Users className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Citizen Engagement</h3>
              <p className="text-gray-600 text-sm">
                Your voice matters in governance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flag className="h-5 w-5 text-emerald-400" />
                <span className="text-white font-bold">Guyana Citizen Engagement</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Empowering citizens to share ideas and report community issues for a better Guyana.
              </p>
              <p className="text-sm text-gray-500">
                A platform for citizen engagement and community development.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Government Resources</h4>
              <a
                href="https://www.gov.gy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                Government Portal
                <ChevronRight className="h-3 w-3" />
              </a>
              <p className="text-xs text-gray-500 mt-1">
                Access all government services, agencies, and resources
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Information</h4>
              <p className="text-sm text-gray-300 font-medium">Michael Annamunthodo</p>
              <p className="text-sm text-gray-500 mb-3">Independent Platform Creator</p>
              <a
                href="mailto:kpbcma@gmail.com"
                className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                kpbcma@gmail.com
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-gray-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Disclaimer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GuyanaFlag({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="4" fill="#009739" />
      <polygon points="0,0 48,24 0,48" fill="#FCD116" />
      <polygon points="0,4 40,24 0,44" fill="#009739" />
      <polygon points="0,0 24,24 0,48" fill="#CE1126" />
      <polygon points="0,4 20,24 0,44" fill="#000000" />
    </svg>
  );
}
