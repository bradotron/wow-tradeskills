require("dotenv").config();
axios = require("axios");

const {
  AccessToken,
  BlizzardApiInterface,
} = require("./BlizzardApiInterface/BlizzardApiInterface");

const fs = require("fs");

function WriteJSONToFile(data, fileName) {
  let jsonData = JSON.stringify(data);
  fs.writeFileSync(fileName, jsonData);
}

bai = new BlizzardApiInterface(
  process.env.BLIZZARD_CLIENT_ID,
  process.env.BLIZZARD_CLIENT_SECRET
);

bai
  .initialize()
  .then((result) => {
    console.log("initialized");
    /////////////
    // Connected Realms section
    /////////
    // bai.getConnectedRealmsIndex().then((data) => {
    //   let ConnectedRealmsIndex = data;
    //   WriteJSONToFile(ConnectedRealmsIndex, "ConnectedRealmsIndex.json");

    //   let start = Date.now();
    //   bai.getConnectedRealms().then(data => {
    //     WriteJSONToFile(data, "ConnectedRealms.json");
    //     let end = Date.now();
    //     console.log(`Elapsed Time: ${end - start}`);
    //   });
    // });

    //////////
    // Profession Section
    //////////
    // bai
    //   .getProfessions()
    //   .then((data) => {
    //     WriteJSONToFile(data, "Professions.json");
    //   })
    //   .catch((error) => console.log(error));

    //////////
    // Skill Tiers Section
    //////////
    // bai
    //   .getSkillTiers()
    //   .then((data) => {
    //     WriteJSONToFile(data, "SkillTiers.json");
    //   })
    //   .catch((error) => console.log(error));

    ///////////
    // Recipes Section
    ///////////
    bai
      .getRecipes()
      .then((data) => {
        WriteJSONToFile(data, "Recipes.json");
      })
      .catch((error) => console.log(error));

    // let RecipeUrls = JSON.parse(fs.readFileSync("./RecipeUrls.json"));
    // console.log(RecipeUrls.length);
    // console.log("done");
  })
  .catch((error) => console.log(error));
