import * as fs from "fs";

export const JSONReadGameFile = (jsonFilePath): any => {
  try {
    const jsonString = fs.readFileSync(jsonFilePath);
    return JSON.parse(jsonString.toString());
  } catch (error) {
    console.log("ERROR IN READING FROM game-boards:", error);
    return;
  }
};

export const JSONWriteGameFile = (jsonFilePath, data): void => {
  fs.writeFile(jsonFilePath, data, (error) => {
    if (error) {
      console.log("ERROR IN WRITING TO game-boards:", error);
    } else {
      console.log("FILE WROTE SUCCESSFULLY");
    }
  });
};

export const JSONUpdateGameFile = (jsonFilePath, data): void => {
  const fetchedData = JSONReadGameFile(jsonFilePath);
  fetchedData.push(JSON.parse(data));
  JSONWriteGameFile(jsonFilePath, JSON.stringify(fetchedData));
};
