import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Candidate } from "@shared/schema";
import { Shield, CheckCircle } from "lucide-react";

export function VotingInterface() {
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [voterToken] = useState(() => `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { toast } = useToast();

  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const { data: voteStatus } = useQuery<{ hasVoted: boolean }>({
    queryKey: ["/api/votes/check", voterToken],
  });

  const castVoteMutation = useMutation({
    mutationFn: async (candidateId: number) => {
      const response = await apiRequest("POST", "/api/votes", {
        candidateId,
        voterToken,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vote Cast Successfully",
        description: "Your vote has been recorded securely and anonymously.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/votes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      // Auto-refresh the page after successful voting
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Voting Failed", 
        description: error.message || "Failed to cast your vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitVote = () => {
    if (!selectedCandidate) {
      toast({
        title: "No Candidate Selected",
        description: "Please select a candidate before casting your vote.",
        variant: "destructive",
      });
      return;
    }

    castVoteMutation.mutate(parseInt(selectedCandidate));
  };

  if (voteStatus?.hasVoted) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border border-neutral-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Thank You for Voting!</h2>
              <p className="text-neutral-600">
                You have already cast your vote in this election. Your vote has been recorded securely.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border border-neutral-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-neutral-200 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-neutral-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="rounded-xl shadow-2xl border border-neutral-300 overflow-hidden bg-white/80 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-blue-600 via-primary to-indigo-600 px-6 py-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-3">Cast Your Vote</h2>
            <p className="text-blue-100 text-lg">Select your preferred candidate for the upcoming election</p>
            <div className="mt-4 flex items-center space-x-2 text-blue-200">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Secure & Anonymous Voting</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* Election Status */}
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-secondary text-xl" />
              <div>
                <h3 className="font-semibold text-secondary">Election Active</h3>
                <p className="text-sm text-neutral-600">Voting is currently open</p>
              </div>
            </div>
          </div>

          {/* Candidates List */}
          <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div 
                  key={candidate.id} 
                  className={`candidate-card border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                    selectedCandidate === candidate.id.toString()
                      ? "border-primary bg-blue-50 shadow-lg"
                      : "border-neutral-200 bg-white hover:border-blue-300 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedCandidate(candidate.id.toString())}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
                        {candidate.symbolImage ? (
                          <img 
                            src={candidate.symbolImage} 
                            alt={`${candidate.name} symbol`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-neutral-600">
                            {candidate.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-1">{candidate.name}</h3>
                        <p className="text-sm text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full inline-block">
                          {candidate.experience}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem 
                        value={candidate.id.toString()} 
                        id={`candidate-${candidate.id}`}
                        className="w-6 h-6"
                      />
                      <Label htmlFor={`candidate-${candidate.id}`} className="text-base font-semibold text-neutral-700">
                        Select
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>

          {/* Vote Confirmation */}
          <div className="mt-10 pt-8 border-t border-neutral-300">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3 text-neutral-600">
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Secure & Anonymous</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Verified System</span>
                </div>
              </div>
              <Button 
                onClick={handleSubmitVote}
                disabled={!selectedCandidate || castVoteMutation.isPending}
                className="bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                {castVoteMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-3"></i>
                    Casting Vote...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-3" />
                    Cast Your Vote
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
