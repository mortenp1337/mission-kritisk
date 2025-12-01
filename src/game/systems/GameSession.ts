// GameSession singleton - persists game state across scenes
import { GameSession as IGameSession, PlacedTowerData } from '../types/GameTypes';
import { SPEED_CONTROL } from '../constants/speedControl';
import { WAVE_PROGRESSION } from '../data/gameplayConfig';

export class GameSession implements IGameSession {
    private static instance: GameSession;
    
    grade: number;  // DEPRECATED: Use difficulty instead
    difficulty: number;
    category: string;
    challengeType: string;
    coins: number;
    currentWave: number;
    baseHealth: number;
    placedTowers: PlacedTowerData[];
    problemsSolved: number;
    totalScore: number;
    gameSpeed: number;
    
    private constructor() {
        this.reset();
    }
    
    static getInstance(): GameSession {
        if (!GameSession.instance) {
            GameSession.instance = new GameSession();
        }
        return GameSession.instance;
    }
    
    reset(): void {
        this.grade = 0;  // DEPRECATED: Kept for backward compatibility
        this.difficulty = 1;
        this.category = '';
        this.challengeType = '';
        this.coins = WAVE_PROGRESSION.STARTING_COINS;
        this.currentWave = 1;
        this.baseHealth = WAVE_PROGRESSION.BASE_HEALTH;
        this.placedTowers = [];
        this.problemsSolved = 0;
        this.totalScore = 0;
        this.gameSpeed = 1.0;
    }
    
    setGrade(grade: number): void {
        if (grade < 0 || grade > 3) {
            throw new Error(`Invalid grade: ${grade}. Must be 0-3.`);
        }
        this.grade = grade;
    }
    
    setDifficulty(difficulty: number): void {
        if (difficulty < 1 || difficulty > 4) {
            throw new Error(`Invalid difficulty: ${difficulty}. Must be 1-4.`);
        }
        this.difficulty = difficulty;
        // Maintain backward compatibility: set grade = difficulty - 1
        this.grade = difficulty - 1;
    }
    
    setCategory(category: string): void {
        if (category !== 'math' && category !== 'logic') {
            throw new Error(`Invalid category: ${category}. Must be 'math' or 'logic'.`);
        }
        this.category = category;
    }
    
    setChallengeType(type: string): void {
        this.challengeType = type;
    }
    
    addCoins(amount: number): void {
        this.coins += amount;
        if (this.coins < 0) {
            this.coins = 0;
        }
    }
    
    spendCoins(amount: number): boolean {
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }
    
    placeTower(towerData: PlacedTowerData): void {
        this.placedTowers.push(towerData);
    }
    
    damageBase(amount: number = 1): void {
        this.baseHealth -= amount;
        if (this.baseHealth < 0) {
            this.baseHealth = 0;
        }
    }
    
    incrementWave(): void {
        if (this.currentWave < WAVE_PROGRESSION.TOTAL_WAVES) {
            this.currentWave++;
        }
    }
    
    incrementProblemsSolved(): void {
        this.problemsSolved++;
    }
    
    addToScore(points: number): void {
        this.totalScore += points;
    }
    
    isGameOver(): boolean {
        return this.baseHealth <= 0;
    }
    
    hasWon(): boolean {
        return this.currentWave > WAVE_PROGRESSION.TOTAL_WAVES && this.baseHealth > 0;
    }
    
    setGameSpeed(multiplier: number): void {
        this.gameSpeed = Math.max(SPEED_CONTROL.MIN_SPEED, Math.min(SPEED_CONTROL.MAX_SPEED, multiplier));
    }
    
    resetGameSpeed(): void {
        this.gameSpeed = 1.0;
    }
}
