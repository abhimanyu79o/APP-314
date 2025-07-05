import { candidates, votes, admins, type Candidate, type InsertCandidate, type Vote, type InsertVote, type Admin, type InsertAdmin } from "@shared/schema";

export interface IStorage {
  // Candidates
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;
  
  // Votes
  getVotes(): Promise<Vote[]>;
  castVote(vote: InsertVote): Promise<Vote>;
  hasVoted(voterToken: string): Promise<boolean>;
  
  // Admins
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class MemStorage implements IStorage {
  private candidates: Map<number, Candidate>;
  private votes: Map<number, Vote>;
  private admins: Map<number, Admin>;
  private currentCandidateId: number;
  private currentVoteId: number;
  private currentAdminId: number;

  constructor() {
    this.candidates = new Map();
    this.votes = new Map();
    this.admins = new Map();
    this.currentCandidateId = 1;
    this.currentVoteId = 1;
    this.currentAdminId = 1;

    // Initialize with sample candidates and admin
    this.initializeData();
  }

  private initializeData() {
    // Create default admin
    const defaultAdmin: Admin = {
      id: this.currentAdminId++,
      username: "UNIQUE",
      password: "UNIQUE123", // In production, this should be hashed
    };
    this.admins.set(defaultAdmin.id, defaultAdmin);

    // Create sample candidates
    const sampleCandidates: InsertCandidate[] = [
      {
        name: "John Mitchell",
        party: "Democratic Party",
        experience: "15 years in public service",
      },
      {
        name: "Sarah Chen",
        party: "Republican Party", 
        experience: "Former Mayor, 8 years",
      },
      {
        name: "Robert Taylor",
        party: "Independent",
        experience: "Business Leader, Community Advocate",
      },
    ];

    sampleCandidates.forEach(candidateData => {
      const candidate: Candidate = {
        ...candidateData,
        id: this.currentCandidateId++,
        votes: 0,
      };
      this.candidates.set(candidate.id, candidate);
    });
  }

  async getCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async createCandidate(candidateData: InsertCandidate): Promise<Candidate> {
    const candidate: Candidate = {
      ...candidateData,
      id: this.currentCandidateId++,
      votes: 0,
    };
    this.candidates.set(candidate.id, candidate);
    return candidate;
  }

  async updateCandidate(id: number, candidateData: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const existing = this.candidates.get(id);
    if (!existing) return undefined;
    
    const updated: Candidate = { ...existing, ...candidateData };
    this.candidates.set(id, updated);
    return updated;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    return this.candidates.delete(id);
  }

  async getVotes(): Promise<Vote[]> {
    return Array.from(this.votes.values());
  }

  async castVote(voteData: InsertVote): Promise<Vote> {
    const vote: Vote = {
      ...voteData,
      id: this.currentVoteId++,
    };
    this.votes.set(vote.id, vote);
    
    // Update candidate vote count
    const candidate = this.candidates.get(voteData.candidateId);
    if (candidate) {
      candidate.votes++;
      this.candidates.set(candidate.id, candidate);
    }
    
    return vote;
  }

  async hasVoted(voterToken: string): Promise<boolean> {
    return Array.from(this.votes.values()).some(vote => vote.voterToken === voterToken);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.username === username);
  }

  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const admin: Admin = {
      ...adminData,
      id: this.currentAdminId++,
    };
    this.admins.set(admin.id, admin);
    return admin;
  }
}

export const storage = new MemStorage();
