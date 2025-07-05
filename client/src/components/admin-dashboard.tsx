import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AddCandidateModal } from "./add-candidate-modal";
import { ResultsDashboard } from "./results-dashboard";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Candidate } from "@shared/schema";
import { Shield, Users, Vote, CheckCircle, Edit, Trash2, Plus, BarChart3 } from "lucide-react";

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSection, setActiveSection] = useState<"candidates" | "results">("candidates");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const { toast } = useToast();

  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
    enabled: isAuthenticated,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: async (candidateId: number) => {
      const response = await apiRequest("DELETE", `/api/candidates/${candidateId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Candidate Deleted",
        description: "The candidate has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete candidate.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleDeleteCandidate = (candidateId: number) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      deleteCandidateMutation.mutate(candidateId);
    }
  };

  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="rounded-xl shadow-lg border border-neutral-200">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900">Admin Access</h2>
              <p className="text-neutral-600">Enter your credentials to access the admin dashboard</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Enter admin username"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter admin password"
                  className="w-full"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loginMutation.isPending}
                className="w-full bg-primary hover:bg-blue-700"
              >
                {loginMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Signing In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Admin Navigation */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b border-neutral-200">
          <button
            onClick={() => setActiveSection("candidates")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeSection === "candidates"
                ? "text-primary border-primary"
                : "text-neutral-500 hover:text-neutral-700 border-transparent"
            }`}
          >
            <Users className="w-4 h-4 mr-2 inline" />
            Candidate Management
          </button>
          <button
            onClick={() => setActiveSection("results")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeSection === "results"
                ? "text-primary border-primary"
                : "text-neutral-500 hover:text-neutral-700 border-transparent"
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2 inline" />
            Election Results
          </button>
        </div>
      </div>

      {activeSection === "results" && <ResultsDashboard />}

      {activeSection === "candidates" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidate Management Panel */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl shadow-lg border border-neutral-200">
              <CardHeader className="px-6 py-4 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-neutral-900 flex items-center">
                    <Users className="mr-2 text-primary" />
                    Candidate Management
                  </CardTitle>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-secondary hover:bg-green-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Candidate
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-neutral-200 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                            <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 font-semibold text-neutral-700">Candidate</th>
                          <th className="text-left py-3 px-4 font-semibold text-neutral-700">Symbol</th>
                          <th className="text-left py-3 px-4 font-semibold text-neutral-700">Votes</th>
                          <th className="text-left py-3 px-4 font-semibold text-neutral-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map((candidate) => (
                          <tr key={candidate.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-neutral-600">
                                    {candidate.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-neutral-900">{candidate.name}</div>
                                  <div className="text-sm text-neutral-500">ID: #{candidate.id.toString().padStart(3, '0')}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {candidate.symbolImage ? (
                                <img 
                                  src={candidate.symbolImage} 
                                  alt="Candidate symbol"
                                  className="w-8 h-8 object-cover rounded"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-neutral-200 rounded flex items-center justify-center">
                                  <span className="text-xs text-neutral-500">No symbol</span>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                {candidate.votes}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-primary hover:text-blue-700 p-2"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteCandidate(candidate.id)}
                                  className="text-red-500 hover:text-red-700 p-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Total Votes Card */}
            <Card className="rounded-xl shadow-lg border border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Total Votes</p>
                    <p className="text-3xl font-bold text-neutral-900">{totalVotes.toLocaleString()}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Vote className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <i className="fas fa-arrow-up text-secondary text-sm mr-1"></i>
                  <span className="text-secondary text-sm font-medium">Live count</span>
                  <span className="text-neutral-500 text-sm ml-2">real-time updates</span>
                </div>
              </CardContent>
            </Card>

            {/* Active Candidates Card */}
            <Card className="rounded-xl shadow-lg border border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Active Candidates</p>
                    <p className="text-3xl font-bold text-neutral-900">{candidates.length}</p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <Users className="w-8 h-8 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Election Status Card */}
            <Card className="rounded-xl shadow-lg border border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Election Status</p>
                    <p className="text-lg font-semibold text-secondary">Active</p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Started:</span>
                    <span className="text-neutral-900">Nov 1, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Status:</span>
                    <span className="text-neutral-900">Open for Voting</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <AddCandidateModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </>
  );
}