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
      <Card className="rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Cast Your Vote</h2>
          <p className="text-blue-100">Select your preferred candidate for the upcoming election</p>
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
                  className="candidate-card border border-neutral-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedCandidate(candidate.id.toString())}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
                        {candidate.symbolImage ? (
                          <img 
                            src={candidate.symbolImage} 
                            alt={`${candidate.name} symbol`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-neutral-600">
                            {candidate.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">{candidate.name}</h3>
                        <p className="text-xs text-neutral-500">{candidate.experience}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={candidate.id.toString()} id={`candidate-${candidate.id}`} />
                      <Label htmlFor={`candidate-${candidate.id}`} className="text-sm font-medium text-neutral-500">
                        Select
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>

          {/* Vote Confirmation */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-neutral-600">
                <Shield className="w-4 h-4 text-secondary mr-2" />
                Your vote is secure and anonymous
              </div>
              <Button 
                onClick={handleSubmitVote}
                disabled={!selectedCandidate || castVoteMutation.isPending}
                className="bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-8"
              >
                {castVoteMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Casting Vote...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Cast Vote
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
