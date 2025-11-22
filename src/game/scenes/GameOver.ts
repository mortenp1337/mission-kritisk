import { Scene } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;
    stats_text: Phaser.GameObjects.Text;
    button_text: Phaser.GameObjects.Text;
    private victory: boolean;

    constructor ()
    {
        super('GameOver');
    }

    init(data: { victory?: boolean } = {})
    {
        this.victory = data.victory || false;
    }

    create ()
    {
        const session = GameSession.getInstance();
        
        this.camera = this.cameras.main;
        
        // Set background color based on victory/defeat
        if (this.victory) {
            this.camera.setBackgroundColor(0x00aa00); // Green for victory
        } else {
            this.camera.setBackgroundColor(0xff0000); // Red for defeat
        }

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        // Main message
        const mainMessage = this.victory ? DanishText.victory : DanishText.defeat;
        this.gameover_text = this.add.text(512, 250, mainMessage, {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);

        // Stats display
        const statsLines = [
            DanishText.wavesCompleted + ' ' + (this.victory ? '5' : (session.currentWave - 1)),
            DanishText.coinsEarned + ' ' + session.totalScore,
            DanishText.problemsSolved + ' ' + session.problemsSolved
        ];
        
        this.stats_text = this.add.text(512, 400, statsLines.join('\n'), {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Back to menu button
        this.button_text = this.add.text(512, 550, DanishText.backToMenu, {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        
        this.button_text.setInteractive({ useHandCursor: true });
        
        this.button_text.on('pointerdown', () => {
            session.reset();
            this.scene.start('MainMenu');
        });
        
        this.button_text.on('pointerover', () => {
            this.button_text.setScale(1.1);
        });
        
        this.button_text.on('pointerout', () => {
            this.button_text.setScale(1.0);
        });
    }
}
