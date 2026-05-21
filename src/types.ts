/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physicality: number;
}

export interface Player {
  id: string;
  name: string; // English Name
  arName: string; // Arabic Name
  number: number;
  position: 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
  arPosition: string; // Arabic Position Name
  club: string;
  clubLogoUrl?: string;
  age: number;
  height: string;
  weight: string;
  caps: number; // International appearances
  goals: number;
  bio: string; // Arabic bio snippet
  detailedBio: string; // Extra Arabic detailed text
  stats: PlayerStats;
  avatarPlaceholderColor: string;
  imageUrl?: string;
}

export interface Milestone {
  id: string;
  year: string;
  title: string;
  arabicTitle: string;
  summary: string;
  detailedParagraphs: string[];
  keyFigures: string[];
  imageUrl?: string;
}

export interface Trophy {
  id: string;
  title: string;
  year: string;
  achievement: string;
  description: string;
  iconType: 'gold_cup' | 'silver_cup' | 'bronze_medal' | 'certificate';
  imageUrl?: string;
}

export interface MatchAnalysis {
  id: string;
  title: string;
  opponent: string;
  date: string;
  score: string;
  formation: string;
  description: string;
  tacticalNotes: string[];
  lineup: string[]; // Player IDs or Names
}
