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
    { id: "results" as const, label: "Results", icon: "fas fa-chart-pie" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Vote className="text-2xl text-primary" />
                <h1 className="text-xl font-bold text-neutral-900">VoteSecure</h1>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "text-primary border-primary"
                      : "text-neutral-500 hover:text-neutral-700 border-transparent"
                  }`}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-500">Guest User</span>
              <button className="bg-neutral-200 hover:bg-neutral-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "voting" && <VotingInterface />}
        {activeTab === "admin" && <AdminDashboard />}
        {activeTab === "results" && <ResultsDashboard />}
      </main>
    </div>
  );
}
