import { candidates, votes, admins, type Candidate, type InsertCandidate, type Vote, type InsertVote, type Admin, type InsertAdmin } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates);
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate || undefined;
  }

  async createCandidate(candidateData: InsertCandidate): Promise<Candidate> {
    const [candidate] = await db
      .insert(candidates)
      .values(candidateData)
      .returning();
    return candidate;
  }

  async updateCandidate(id: number, candidateData: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [candidate] = await db
      .update(candidates)
      .set(candidateData)
      .where(eq(candidates.id, id))
      .returning();
    return candidate || undefined;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    const result = await db.delete(candidates).where(eq(candidates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getVotes(): Promise<Vote[]> {
    return await db.select().from(votes);
  }

  async castVote(voteData: InsertVote): Promise<Vote> {
    const [vote] = await db
      .insert(votes)
      .values(voteData)
      .returning();
    
    // Update candidate vote count
    const [currentCandidate] = await db.select().from(candidates).where(eq(candidates.id, voteData.candidateId));
    if (currentCandidate) {
      await db
        .update(candidates)
        .set({ votes: currentCandidate.votes + 1 })
        .where(eq(candidates.id, voteData.candidateId));
    }
    
    return vote;
  }

  async hasVoted(voterToken: string): Promise<boolean> {
    const [vote] = await db.select().from(votes).where(eq(votes.voterToken, voterToken));
    return !!vote;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(adminData)
      .returning();
    return admin;
  }

  async initializeData(): Promise<void> {
    // Check if admin already exists
    const existingAdmin = await this.getAdminByUsername("UNIQUE");
    if (!existingAdmin) {
      await this.createAdmin({
        username: "UNIQUE",
        password: "UNIQUE123", // In production, this should be hashed
      });
    }

    // Check if sample candidates exist
    const existingCandidates = await this.getCandidates();
    if (existingCandidates.length === 0) {
      const sampleCandidates: InsertCandidate[] = [
        {
          name: "John Mitchell",
          experience: "15 years in public service",
          symbolImage: null,
        },
        {
          name: "Sarah Chen",
          experience: "Former Mayor, 8 years",
          symbolImage: null,
        },
        {
          name: "Robert Taylor",
          experience: "Business Leader, Community Advocate",
          symbolImage: null,
        },
      ];

      for (const candidateData of sampleCandidates) {
        await this.createCandidate(candidateData);
      }
    }
  }
}

export const storage = new DatabaseStorage();
