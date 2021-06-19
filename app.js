const input = require('./config');

class Game {
    constructor(rangeOfTower, enemies, simulation) {
        this.simulation = simulation;
        this.status = true;
        this.maxTurns = 0;
        this.turns = {};
        this.rangeOfTower = rangeOfTower;
        this.enemies = enemies;
        this.enemyOutOfRange = [];
        this.minDistance = this.rangeOfTower;
        this.startGame();
    }

    log(msg) {
        if(!this.simulation) console.log(msg);
    }

    startGame() {
        try {
            this.enemies.forEach(enemy => {
                this.checkEnemy(enemy);
            });   
            this.outputResults();
        } catch (error) {
            console.error(error);
            const msg = `Game failed with error ${error}`;
            this.endGame(msg);
        } 
    }

    checkEnemy(enemy) {
        const { turnsNumberToRange, turnsNumberToTower } = this.checkDistanceOfRange(enemy);
        const turnsNumberToTowerFromRange = turnsNumberToTower - turnsNumberToRange;
        const enemyForTurn = Object.assign({ enemy }, { turnsNumberToTowerFromRange });
        this.putEnemyInTurn(enemyForTurn, turnsNumberToRange);
    }

    checkDistanceOfRange(enemy) {
        if (enemy.distance < 0) throw new Error(`Distance of enemy can't be negative`);
        if (enemy.speed <= 0) throw new Error(`Speed of enemy can't be negative or 0`);
        const turnsNumberToTower = Math.ceil(enemy.distance / enemy.speed);
        let turnsNumberToRange = Math.ceil((enemy.distance - this.rangeOfTower) / enemy.speed);
        if (turnsNumberToRange < 1) turnsNumberToRange = 0;
        return {
            turnsNumberToRange,
            turnsNumberToTower
        }
    }

    putEnemyInTurn(enemyForTurn, turnsNumberToRange) {
        if (!this.turns[turnsNumberToRange]) {
            this.turns[turnsNumberToRange] = enemyForTurn;
            if (turnsNumberToRange > this.maxTurns) this.maxTurns = turnsNumberToRange;
        } else {
            // check another enemy on this turn
            this.checkEnemyInTurn(this.turns[turnsNumberToRange], enemyForTurn, turnsNumberToRange);
        }
    }

    checkEnemyInTurn(enemyForTurnA, enemyForTurnB, turnsNumberToRange) {
        if (enemyForTurnA.turnsNumberToTowerFromRange <= enemyForTurnB.turnsNumberToTowerFromRange) {
            enemyForTurnB.turnsNumberToTowerFromRange -= 1;
            this.putEnemyInTurn(enemyForTurnB, turnsNumberToRange +=1);
        } else {
            this.turns[turnsNumberToRange] = enemyForTurnB;
            enemyForTurnA.turnsNumberToTowerFromRange -= 1;
            this.putEnemyInTurn(enemyForTurnA, turnsNumberToRange +=1);
        }
    }

    outputResults() {
        let msg = `You win in ${this.maxTurns + 1} turns`;
        let reasonOfLose = '';
        this.log(`Firing range is ${this.rangeOfTower}m`);
        for (let i = 0; i < this.maxTurns + 1; i++) {
            if (this.turns[i]) {
                const { enemy }  = this.turns[i];      
                const distanceEnemyForTheTurn = enemy.distance - enemy.speed * i;          
                if (distanceEnemyForTheTurn <= 0) {
                    msg =  `You lose in turn ${i + 1}, enemy is ${enemy.name} killed you.`; 
                    reasonOfLose = `Too many enemies, not enough shots.`;  
                    this.minDistance = 0;
                    if (this.enemyOutOfRange.length > 0) {
                        this.status = false;
                        const minDistance = this.calculateMinDistance(this.enemyOutOfRange.shift());
                        if (minDistance > 0) reasonOfLose = `The firing range is insufficient, min range ${minDistance}`;
                    };
                    msg += reasonOfLose;    
                    break;
                }
                this.log(`Turn ${i + 1}: Kill ${enemy.name} at ${distanceEnemyForTheTurn}m `);
            } else {
                this.log(`Turn ${i + 1}: enemy out of range `);
                this.enemyOutOfRange.push(i);
            }
        }
        this.endGame(msg);
    }

    calculateMinDistance(turn) {
        const newEnimies = [];
        let minDistance = 0;
        for (let i = turn + 1; i < this.maxTurns + 1; i++) {
            let { enemy } = this.turns[i];
            enemy.distance -= enemy.speed * turn;
            if (enemy.distance < minDistance || minDistance === 0) minDistance = enemy.distance;
            newEnimies.push(enemy);
        }
        let simulator = new Game(minDistance, newEnimies, true);
        if (simulator.status === true) return simulator.minDistance;            
        return 0;
    }

    endGame(msg) {        
        this.log(msg);
    }
}

const newGame = new Game(input.rangeOfTower, input.enemies, false);