require("dotenv").config();
const {AccessToken, BlizzardApiInterface} = require("./BlizzardApiInterface/BlizzardApiInterface");

bai = new BlizzardApiInterface(
  process.env.BLIZZARD_CLIENT_ID,
  process.env.BLIZZARD_CLIENT_SECRET
); 

bai.initialize.then(() => {
  console.log(bai.accessToken);
});
