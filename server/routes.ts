import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCandidateSchema, insertVoteSchema, adminLoginSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all candidates
  app.get("/api/candidates", async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  // Create a new candidate
  app.post("/api/candidates", async (req, res) => {
    try {
      const candidateData = insertCandidateSchema.parse(req.body);
      const candidate = await storage.createCandidate(candidateData);
      res.status(201).json(candidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create candidate" });
      }
    }
  });

  // Update a candidate
  app.patch("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const candidateData = insertCandidateSchema.partial().parse(req.body);
      const candidate = await storage.updateCandidate(id, candidateData);
      
      if (!candidate) {
        res.status(404).json({ message: "Candidate not found" });
        return;
      }
      
      res.json(candidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update candidate" });
      }
    }
  });

  // Delete a candidate
  app.delete("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCandidate(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Candidate not found" });
        return;
      }
      
      res.json({ message: "Candidate deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete candidate" });
    }
  });

  // Cast a vote
  app.post("/api/votes", async (req, res) => {
    try {
      const voteData = insertVoteSchema.parse(req.body);
      
      // Check if voter has already voted
      const hasVoted = await storage.hasVoted(voteData.voterToken);
      if (hasVoted) {
        res.status(400).json({ message: "You have already voted" });
        return;
      }
      
      // Check if candidate exists
      const candidate = await storage.getCandidate(voteData.candidateId);
      if (!candidate) {
        res.status(404).json({ message: "Candidate not found" });
        return;
      }
      
      const vote = await storage.castVote(voteData);
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to cast vote" });
      }
    }
  });

  // Check if voter has voted
  app.get("/api/votes/check/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const hasVoted = await storage.hasVoted(token);
      res.json({ hasVoted });
    } catch (error) {
      res.status(500).json({ message: "Failed to check vote status" });
    }
  });

  // Get vote statistics
  app.get("/api/votes/stats", async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
      
      const stats = candidates.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        votes: candidate.votes,
        percentage: totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : "0.0",
      }));
      
      res.json({
        candidates: stats,
        totalVotes,
        turnoutPercentage: "67.3", // This would be calculated based on eligible voters
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vote statistics" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const loginData = adminLoginSchema.parse(req.body);
      const admin = await storage.getAdminByUsername(loginData.username);
      
      if (!admin || admin.password !== loginData.password) {
        res.status(401).json({ message: "Invalid username or password" });
        return;
      }
      
      // In production, return a JWT token instead
      res.json({ 
        message: "Login successful",
        admin: { id: admin.id, username: admin.username }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid login data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Login failed" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
