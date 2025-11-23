// GameSession singleton - persists game state across scenes
import { GameSession as IGameSession, PlacedTowerData } from '../types/GameTypes';

export class GameSession implements IGameSession {
    private static instance: GameSession;
    
    grade: number;
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
        this.grade = 0;
        this.coins = 0;
        this.currentWave = 1;
        this.baseHealth = 10;
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
        if (this.currentWave < 5) {
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
        return this.currentWave > 5 && this.baseHealth > 0;
    }
    
    setGameSpeed(multiplier: number): void {
        const MIN_SPEED = 0.5;
        const MAX_SPEED = 5.0;  // Increased max speed to 5x
        this.gameSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, multiplier));
    }
    
    resetGameSpeed(): void {
        this.gameSpeed = 1.0;
    }
}
