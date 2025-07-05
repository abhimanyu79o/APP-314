import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CandidateForm {
  name: string;
  experience: string;
  symbolImage: string;
}

export function AddCandidateModal({ isOpen, onClose }: AddCandidateModalProps) {
  const [form, setForm] = useState<CandidateForm>({
    name: "",
    experience: "",
    symbolImage: "",
  });
  const { toast } = useToast();

  const addCandidateMutation = useMutation({
    mutationFn: async (candidateData: CandidateForm) => {
      const response = await apiRequest("POST", "/api/candidates", candidateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Candidate Added",
        description: "The new candidate has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Candidate",
        description: error.message || "An error occurred while adding the candidate.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setForm({ name: "", experience: "", symbolImage: "" });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.experience) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    addCandidateMutation.mutate(form);
  };

  const handleInputChange = (field: keyof CandidateForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-neutral-900">Add New Candidate</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="candidateName" className="block text-sm font-medium text-neutral-700 mb-2">
              Candidate Name *
            </Label>
            <Input
              id="candidateName"
              type="text"
              value={form.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter candidate name"
              className="w-full"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="symbolImage" className="block text-sm font-medium text-neutral-700 mb-2">
              Symbol Image URL
            </Label>
            <Input
              id="symbolImage"
              type="url"
              value={form.symbolImage}
              onChange={(e) => handleInputChange("symbolImage", e.target.value)}
              placeholder="Enter image URL for candidate symbol"
              className="w-full"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Provide a URL to an image that represents the candidate's symbol
            </p>
          </div>
          
          <div>
            <Label htmlFor="experience" className="block text-sm font-medium text-neutral-700 mb-2">
              Experience/Background *
            </Label>
            <Textarea
              id="experience"
              value={form.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              placeholder="Brief description of candidate's background"
              rows={3}
              className="w-full"
              required
            />
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={addCandidateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-blue-700"
              disabled={addCandidateMutation.isPending}
            >
              {addCandidateMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Adding...
                </>
              ) : (
                "Add Candidate"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
