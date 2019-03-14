// region Import libraries

import chalk from "chalk";

// endregion

// region Define information texts

const completed = chalk.green.bold("(✓)");
const port = chalk.green.bold("(!)");

// endregion

// region Inform about the state

console.log(`${completed} Starting server...`);
console.log(`${port} Server is online on localhost:5000...`);

// endregion
