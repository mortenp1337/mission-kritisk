import { Scene, GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    startButton: GameObjects.Text;
    originalGameButton: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 460, DanishText.mainTitle, {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Add Start Spil button for math tower defense
        this.startButton = this.add.text(512, 540, DanishText.startGame, {
            fontFamily: 'Arial Black', fontSize: 28, color: '#00ff00',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        
        this.startButton.setInteractive({ useHandCursor: true });
        this.startButton.on('pointerdown', () => {
            this.scene.start('GradeSelection');
        });
        
        this.startButton.on('pointerover', () => {
            this.startButton.setColor('#00ff00');
            this.startButton.setScale(1.1);
        });
        
        this.startButton.on('pointerout', () => {
            this.startButton.setColor('#ffffff');
            this.startButton.setScale(1.0);
        });

        // Keep original game accessible
        this.originalGameButton = this.add.text(512, 620, '(Original Game)', {
            fontFamily: 'Arial', fontSize: 18, color: '#888888',
            align: 'center'
        }).setOrigin(0.5);
        
        this.originalGameButton.setInteractive({ useHandCursor: true });
        this.originalGameButton.on('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
