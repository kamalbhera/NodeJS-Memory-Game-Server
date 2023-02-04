import App from "./app";
import "dotenv/config";
import validateEnv from "./utils/validateEnv";
import GamesController from "./controllers/game/game.controller";

validateEnv();

const app = new App([new GamesController()], 5000); // see constructor of App

app.listen(); // this.app.listen(this.port)
