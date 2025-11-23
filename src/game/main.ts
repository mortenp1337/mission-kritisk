import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { GradeSelection } from './scenes/GradeSelection';
import { DifficultySelection } from './scenes/DifficultySelection';
import { CategorySelection } from './scenes/CategorySelection';
import { ChallengeTypeMenu } from './scenes/ChallengeTypeMenu';
import { MathChallenge } from './scenes/MathChallenge';
import { TowerPlacement } from './scenes/TowerPlacement';
import { DefenseWave } from './scenes/DefenseWave';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        DifficultySelection,
        CategorySelection,
        ChallengeTypeMenu,
        GradeSelection,
        MathChallenge,
        TowerPlacement,
        DefenseWave,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
