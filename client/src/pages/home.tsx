import { useState } from "react";
import { VotingInterface } from "@/components/voting-interface";
import { AdminDashboard } from "@/components/admin-dashboard";
import { ResultsDashboard } from "@/components/results-dashboard";
import { Vote } from "lucide-react";

type Tab = "voting" | "admin" | "results";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("voting");

  const tabs = [
    { id: "voting" as const, label: "Voting", icon: "fas fa-ballot" },
    { id: "admin" as const, label: "Admin", icon: "fas fa-cog" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 shadow-2xl hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                <img 
                  src="https://i.ibb.co/NnFMpkgH/logo.png" 
                  alt="ABHI SOLUTIONS Logo" 
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-white">ABHI SOLUTIONS</h1>
                <p className="text-sm text-purple-200 leading-none">Digital Voting Platform</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-white">ABHI</h1>
                <p className="text-xs text-purple-200 leading-none">Voting</p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white text-purple-800 shadow-lg transform scale-105"
                      : "text-purple-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <i className={`${tab.icon} mr-1 md:mr-2`}></i>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.charAt(0)}</span>
                </button>
              ))}
            </nav>

            {/* Status */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white">Live</span>
              </div>
              <div className="md:hidden">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="sm:hidden sticky top-0 z-50 bg-white border-b border-purple-200 shadow-sm">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "text-purple-600 hover:bg-purple-50"
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="min-h-[calc(100vh-240px)] sm:min-h-[calc(100vh-240px)]">
          {activeTab === "voting" && <VotingInterface />}
          {activeTab === "admin" && <AdminDashboard />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 border-t border-purple-700 mt-auto hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                <img 
                  src="https://i.ibb.co/NnFMpkgH/logo.png" 
                  alt="ABHI SOLUTIONS Logo" 
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="text-sm font-bold text-white">© 2025 ABHI SOLUTIONS</span>
            </div>
            <div className="text-xs text-purple-200 text-center md:text-right">
              Digital Voting Platform<br className="md:hidden" />
              <span className="hidden md:inline"> | </span>All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
