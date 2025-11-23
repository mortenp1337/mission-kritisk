// WaveManager system - controls zombie spawning and wave progression
import { WaveConfig } from '../types/EnemyTypes';
import { calculateWaveConfig } from '../data/waveConfig';
import { Zombie } from '../entities/enemies/Zombie';
import { Grid } from '../entities/Grid';
import { gridToScreen } from '../data/levelLayout';

export class WaveManager {
    private waveConfig: WaveConfig;
    private grid: Grid;
    private scene: Phaser.Scene;
    private zombies: Zombie[];
    private spawnedCount: number;
    private spawnTimer: number;
    private waveStarted: boolean;
    
    constructor() {
        this.zombies = [];
        this.spawnedCount = 0;
        this.spawnTimer = 0;
        this.waveStarted = false;
    }
    
    initializeWave(waveNumber: number, grid: Grid, scene: Phaser.Scene): void {
        this.waveConfig = calculateWaveConfig(waveNumber);
        this.grid = grid;
        this.scene = scene;
        this.zombies = [];
        this.spawnedCount = 0;
        this.spawnTimer = 0;
        this.waveStarted = false;
    }
    
    startWave(): void {
        this.waveStarted = true;
        this.spawnTimer = 0;
    }
    
    update(_time: number, delta: number): void {
        if (!this.waveStarted) {
            return;
        }
        
        // Spawn zombies at intervals, scaled by game speed to maintain relative spacing
        if (this.spawnedCount < this.waveConfig.zombieCount) {
            const scaledDelta = delta * this.scene.time.timeScale;
            this.spawnTimer += scaledDelta;
            
            if (this.spawnTimer >= this.waveConfig.spawnInterval) {
                this.spawnZombie();
                this.spawnTimer = 0;
            }
        }
        
        // Update all zombies
        const gridToScreenFn = (pos: any) => gridToScreen(pos);
        this.zombies.forEach(zombie => {
            if (zombie.isAlive()) {
                zombie.update(delta, gridToScreenFn);
            }
        });
        
        // Remove dead zombies
        this.zombies = this.zombies.filter(zombie => zombie.isAlive());
    }
    
    private spawnZombie(): void {
        const spawnPos = gridToScreen(this.grid.spawnPoint);
        const zombie = new Zombie(
            this.waveConfig.zombieStats,
            this.grid.path,
            spawnPos,
            this.scene
        );
        
        this.zombies.push(zombie);
        this.spawnedCount++;
    }
    
    isWaveComplete(): boolean {
        // Wave is complete when all zombies are spawned and all are dead or reached end
        return this.spawnedCount >= this.waveConfig.zombieCount && this.zombies.length === 0;
    }
    
    getWaveConfig(): WaveConfig {
        return this.waveConfig;
    }
    
    getActiveZombies(): Zombie[] {
        return this.zombies.filter(zombie => zombie.isAlive());
    }
    
    getZombiesReachedEnd(): Zombie[] {
        return this.zombies.filter(zombie => zombie.hasReachedEnd());
    }
    
    removeZombie(zombie: Zombie): void {
        zombie.destroy();
        const index = this.zombies.indexOf(zombie);
        if (index > -1) {
            this.zombies.splice(index, 1);
        }
    }
}
