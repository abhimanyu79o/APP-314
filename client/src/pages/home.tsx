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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-neutral-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-50 to-blue-50 shadow-lg border-b border-neutral-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="https://i.ibb.co/NnFMpkgH/logo.png" 
                  alt="ABHI SOLUTIONS Logo" 
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">ABHI SOLUTIONS</h1>
                  <p className="text-xs text-neutral-500 leading-none">Digital Voting Platform</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-md"
                      : "text-neutral-600 hover:text-neutral-800 hover:bg-white/50"
                  }`}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-neutral-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">System Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "voting" && <VotingInterface />}
        {activeTab === "admin" && <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-100 to-blue-100 border-t border-neutral-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img 
                src="https://i.ibb.co/NnFMpkgH/logo.png" 
                alt="ABHI SOLUTIONS Logo" 
                className="h-6 w-6 object-contain"
              />
              <span className="text-sm font-semibold text-neutral-700">© 2025 ABHI SOLUTIONS</span>
            </div>
            <div className="text-xs text-neutral-500">
              Secure Digital Voting Platform | All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
