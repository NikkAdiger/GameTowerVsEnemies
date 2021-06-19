1. The game is written in JS, not TS. This is done on purpose so as not to use packages from the node_modules. You can copy the script and run it on a computer with nodeJS with command: "node app.js".
2. All initial settings are set in the configuration file: config.json
3. The main idea is to make a map with moves and write down all enemies in this map in the order of their removal. If the game is winning, then no problem. The main problem is in losing games. You can lose for two reasons:
    a. There are a lot of enemies and not enough shots, then there is no point in doing an analysis to determine the mines of the turret shot distance.
    b. There are moves in which the enemy is out of reach, and in this case, by increasing the tower shot range, we can kill another enemy. We can calculate the minimum shot distance at which all enemies will be killed.

If there are solutions that are not clear, you can ask, I can explain everything.