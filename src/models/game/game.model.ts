import * as mongoose from "mongoose";
import IGame from "../../interfaces/game/game.interface";

const gameSchema = new mongoose.Schema({
  gameData: Array,
});

const GameModel = mongoose.model<IGame & mongoose.Document>(
  "games", // use plurals in lowercase
  gameSchema
);

export default GameModel;
