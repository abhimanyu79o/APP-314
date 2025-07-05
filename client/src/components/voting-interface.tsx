import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Candidate } from "@shared/schema";
import { Shield, CheckCircle, Timer } from "lucide-react";

export function VotingInterface() {
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [voterToken] = useState(() => `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [cooldownTime, setCooldownTime] = useState<number>(0);
  const [isInCooldown, setIsInCooldown] = useState<boolean>(false);
  const { toast } = useToast();

  // Play beep sound function
  const playBeep = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      setIsInCooldown(true);
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isInCooldown) {
      setIsInCooldown(false);
      playBeep(); // Play beep when cooldown ends
    }
  }, [cooldownTime, isInCooldown]);

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
      playBeep(); // Play beep when vote is submitted
      toast({
        title: "Vote Cast Successfully",
        description: "Your vote has been recorded securely and anonymously.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/votes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      
      // Start cooldown timer
      setCooldownTime(15);
      setSelectedCandidate(""); // Reset selection
      
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
    if (isInCooldown) {
      toast({
        title: "Please Wait",
        description: `You can vote again in ${cooldownTime} seconds.`,
        variant: "destructive",
      });
      return;
    }

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
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <Card className="rounded-2xl shadow-2xl border border-purple-200 overflow-hidden bg-white/90 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-purple-800 via-primary to-indigo-800 px-4 sm:px-6 py-8 sm:py-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent"></div>
          <div className="relative z-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">Cast Your Vote</h2>
            <p className="text-purple-100 text-base sm:text-lg">Select your preferred candidate for the upcoming election</p>
            <div className="mt-4 flex items-center justify-center sm:justify-start space-x-2 text-purple-200">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Secure & Anonymous Voting</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4 sm:p-6">
          {/* Election Status */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <CheckCircle className="text-purple-600 text-xl" />
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-purple-800">Election Active</h3>
                <p className="text-sm text-purple-600">Voting is currently open</p>
              </div>
            </div>
          </div>

          {/* Cooldown Timer */}
          {isInCooldown && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <Timer className="text-orange-600 text-xl animate-pulse" />
                <div>
                  <h3 className="font-semibold text-orange-800">Vote Cooldown Active</h3>
                  <p className="text-sm text-orange-600">Next vote available in {cooldownTime} seconds</p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress 
                  value={((15 - cooldownTime) / 15) * 100} 
                  className="h-3 bg-orange-100"
                />
                <div className="flex justify-between text-xs text-orange-600">
                  <span>Progress: {Math.round(((15 - cooldownTime) / 15) * 100)}%</span>
                  <span>{cooldownTime}s remaining</span>
                </div>
              </div>
            </div>
          )}

          {/* Candidates List */}
          <RadioGroup 
            value={selectedCandidate} 
            onValueChange={isInCooldown ? undefined : setSelectedCandidate}
            disabled={isInCooldown}
          >
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div 
                  key={candidate.id} 
                  className={`candidate-card border-2 rounded-2xl p-4 md:p-6 transition-all duration-300 transform hover:scale-[1.01] ${
                    isInCooldown 
                      ? "opacity-50 cursor-not-allowed" 
                      : "cursor-pointer"
                  } ${
                    selectedCandidate === candidate.id.toString()
                      ? "border-purple-500 bg-purple-50 shadow-xl ring-2 ring-purple-200"
                      : "border-purple-200 bg-white hover:border-purple-400 hover:shadow-lg"
                  }`}
                  onClick={isInCooldown ? undefined : () => setSelectedCandidate(candidate.id.toString())}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 md:space-x-6 flex-1">
                      <div className="candidate-avatar bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center overflow-hidden shadow-lg">
                        {candidate.symbolImage ? (
                          <img 
                            src={candidate.symbolImage} 
                            alt={`${candidate.name} symbol`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl md:text-2xl font-bold text-purple-600 select-none leading-none">
                            {candidate.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-purple-900 mb-1 truncate">{candidate.name}</h3>
                        <div className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full inline-block max-w-full">
                          <span className="truncate">{candidate.experience}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <RadioGroupItem 
                        value={candidate.id.toString()} 
                        id={`candidate-${candidate.id}`}
                        className="w-5 h-5 md:w-6 md:h-6"
                        disabled={isInCooldown}
                      />
                      <Label 
                        htmlFor={`candidate-${candidate.id}`} 
                        className={`text-sm md:text-base font-semibold ${
                          isInCooldown ? "text-gray-400" : "text-purple-700"
                        }`}
                      >
                        Select
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>

          {/* Vote Confirmation */}
          <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-purple-200">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Secure & Anonymous</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Verified System</span>
                </div>
              </div>
              <Button 
                onClick={handleSubmitVote}
                disabled={!selectedCandidate || castVoteMutation.isPending || isInCooldown}
                className={`w-full md:w-auto font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
                  isInCooldown 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white"
                }`}
              >
                {castVoteMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-3"></i>
                    Casting Vote...
                  </>
                ) : isInCooldown ? (
                  <>
                    <Timer className="w-5 h-5 mr-3" />
                    Wait {cooldownTime}s
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
