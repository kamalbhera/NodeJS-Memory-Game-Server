import * as express from "express";
import * as fs from "fs";
import IGame from "../../interfaces/game/game.interface";
import GamesModel from "../../models/game/game.model";
import * as CardsJSONData from "../../../cards.json";
import { JSONWriteGameFile, JSONUpdateGameFile } from "../../helpers/helper";

class GamesController {
  private game = GamesModel;

  public path = "/game";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(`${this.path}/initialize`, this.getInitialGameLayout);
    this.router.post(
      `${this.path}/fetchstate/:id`,
      this.fetchChangedGameLayout
    );
  }

  public getInitialGameLayout = async (
    request: express.Request,
    response: express.Response
  ) => {
    try {
      let cardChoices;
      if (request.query.difficulty && request.query.difficulty === "hard") {
        cardChoices = CardsJSONData;
      } else if (
        request.query.difficulty &&
        request.query.difficulty === "medium"
      ) {
        cardChoices = CardsJSONData.slice(0, 10);
      } else {
        cardChoices = CardsJSONData.slice(0, 5);
      }

      const cardChoicesArray = [...cardChoices].concat([...cardChoices]);
      let shuffledCards = [...cardChoicesArray]
        .map((card) => ({ sortValue: Math.random(), value: card }))
        .sort((a, b) => a.sortValue - b.sortValue)
        .map((sortedCard) => sortedCard.value);
      const initialGameData = { gameData: shuffledCards };

      const createdGameEntry = new this.game(initialGameData);

      let savedGameEntry = await createdGameEntry.save();

      let cardsDataToShow = [];
      for (let elem of savedGameEntry.gameData) {
        cardsDataToShow.push({ value: "FLIP" });
      }

      const JSONResponse = {
        id: savedGameEntry._id,
        difficulty: request.query.difficulty
          ? request.query.difficulty
          : "easy",
        data_length: savedGameEntry.gameData.length,
        data: cardsDataToShow,
        selectedCardsIndices: [],
        match: false,
        solvedCardIndices: [],
        moveErrors: 0,
        gameFinished: false,
      };

      JSONWriteGameFile(
        `./game-boards/${savedGameEntry._id}.json`,
        JSON.stringify([JSONResponse])
      );

      response.status(200);
      response.json(JSONResponse);
    } catch (error: any) {
      response.status(404);
      response.send(error);
    }
  };

  public fetchChangedGameLayout = async (
    request: express.Request,
    response: express.Response
  ) => {
    try {
      let match = false;
      let gameFinished = false;
      let solvedCardIndices;
      let moveErrors = 0;

      const selectedCardsIndices = request.body.selectedCardsIndices;
      const solvedCardIndicesFromPayload = request.body.solvedCardIndices;
      solvedCardIndices = solvedCardIndicesFromPayload;
      const difficulty = request.body.difficulty;
      moveErrors = request.body.moveErrors;
      const id = request.params.id; // no need to parse, findById(id) can use string

      const fetchedGameDataById = await this.game.findById(id);

      if (
        selectedCardsIndices.length === 2 &&
        fetchedGameDataById.gameData[selectedCardsIndices[0]].key ===
          fetchedGameDataById.gameData[selectedCardsIndices[1]].key
      ) {
        match = true;
        solvedCardIndices = [
          ...solvedCardIndicesFromPayload,
          ...selectedCardsIndices,
        ];
      } else if (selectedCardsIndices.length === 2) {
        moveErrors += 1;
      }

      let finalCount: number;
      finalCount =
        difficulty === "hard" ? 50 : difficulty === "medium" ? 20 : 10;
      if (solvedCardIndices.length === finalCount) {
        gameFinished = true;
      }

      const newGameData = [...fetchedGameDataById.gameData].map((elem, i) => {
        if (selectedCardsIndices.includes(i)) {
          return elem;
        } else {
          return { value: "FLIP" };
        }
      });

      const JSONResponse = {
        id: fetchedGameDataById._id,
        difficulty: difficulty,
        data_length: newGameData.length,
        data: newGameData,
        selectedCardsIndices: selectedCardsIndices,
        match: match,
        solvedCardIndices: solvedCardIndices.sort((a, b) => a - b),
        moveErrors: moveErrors,
        gameFinished: gameFinished,
      };

      JSONUpdateGameFile(
        `./game-boards/${fetchedGameDataById._id}.json`,
        JSON.stringify(JSONResponse)
      );

      response.status(200);
      response.json({
        id: fetchedGameDataById._id,
        difficulty: difficulty,
        data_length: newGameData.length,
        data: newGameData,
        selectedCardsIndices: selectedCardsIndices,
        match: match,
        solvedCardIndices: solvedCardIndices.sort((a, b) => a - b),
        moveErrors: moveErrors,
        gameFinished: gameFinished,
      });
    } catch (error: any) {
      response.status(404);
      response.send(error);
    }
  };
}

export default GamesController;
