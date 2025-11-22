// Danish text constants for UI
// All user-facing text should be in Danish per FR-019

export const DanishText = {
    // Main Menu
    mainTitle: 'Mission Kritisk',
    startGame: 'Start Spil',
    
    // Grade Selection
    gradeSelectionTitle: 'Vælg din Klasse',
    gradeLabels: ['Klasse 0', 'Klasse 1', 'Klasse 2', 'Klasse 3'],
    
    // Math Challenge
    solveTheProblem: 'Løs opgaven:',
    problemCounter: (current: number, total: number) => `Problem ${current}/${total}`,
    correct: 'Rigtigt!',
    tryAgain: 'Prøv igen!',
    theAnswerIs: (answer: number) => `Svaret er: ${answer}`,
    coins: 'Mønter:',
    
    // Tower Placement
    buyTower: 'Køb Tårn',
    startWave: 'Start Bølge',
    notEnoughCoins: 'Ikke nok mønter!',
    noSpace: 'Ingen Plads!',
    prepareDefense: 'Forbered Forsvar',
    waveCounter: (current: number, total: number) => `Bølge ${current}/${total}`,
    
    // Tower Shop
    basicTower: 'Basis Tårn',
    rapidTower: 'Hurtig Tårn',
    areaTower: 'Område Tårn',
    towerCost: (cost: number) => `${cost} mønter`,
    upgrade: 'Opgradér',
    
    // Defense Wave
    waveComplete: 'Bølge Fuldført!',
    bonusCoins: (amount: number) => `+${amount} mønter`,
    
    // Game Over
    victory: 'Niveau Fuldført!',
    defeat: 'Spil Tabt!',
    gameOver: 'Spillet Slut',
    tryAgainButton: 'Prøv Igen!',
    backToMenu: 'Tilbage til Menu',
    
    // Stats
    wavesCompleted: 'Bølger Fuldført:',
    coinsEarned: 'Mønter Optjent:',
    problemsSolved: 'Opgaver Løst:',
    
    // Tower Stats Display
    damage: 'Skade:',
    range: 'Rækkevidde:',
    fireRate: 'Ild Hastighed:',
    level: 'Niveau:',
};
