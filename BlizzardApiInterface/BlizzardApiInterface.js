axios = require("axios");

class AccessToken {
  constructor(accessToken, tokenType, expiresIn) {
    this.accessToken = accessToken;
    this.tokenType = tokenType;
    this.expiresIn = expiresIn;
    this.createdAt = Date.now();
  }
}

const MAX_REQUESTS_COUNT = 90;
const INTERVAL_MS = 1000;
let PENDING_REQUESTS = 0;

class BlizzardApiInterface {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.axiosInstance = null;
    this.locale = "en_US";
  }

  initialize = function () {
    return new Promise((resolve, reject) => {
      this.getToken().then((token) => {
        this.setAxiosInstance(token);
        resolve(true);
      });
    });
  };

  getToken = async function () {
    let response = await axios({
      method: "post",
      url: process.env.BLIZZARD_TOKEN_URL,
      auth: {
        username: process.env.BLIZZARD_CLIENT_ID,
        password: process.env.BLIZZARD_CLIENT_SECRET,
      },
      params: {
        grant_type: "client_credentials",
      },
    });
    return response.data;
  };

  setAxiosInstance = function (token) {
    this.axiosInstance = axios.create({
      baseURL: "https://us.api.blizzard.com",
      timeout: 60000, // 1 minute = 60000 ms
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "If-Modified-Since": "header",
      },
    });

    this.axiosInstance.interceptors.request.use(function (config) {
      return new Promise((resolve, reject) => {
        let interval = setInterval(() => {
          if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
            PENDING_REQUESTS++;
            clearInterval(interval);
            resolve(config);
          }
        }, INTERVAL_MS);
      });
    });

    this.axiosInstance.interceptors.response.use(
      function (response) {
        PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
        return Promise.resolve(response);
      },
      function (error) {
        PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
        return Promise.reject(error);
      }
    );
  };

  get = async function (url) {
    let response = await this.axiosInstance.get(url);
    return response.data;
  };

  getConnectedRealmsIndex = async function () {
    let response = await this.axiosInstance.get(
      `data/wow/connected-realm/index?namespace=dynamic-us&local=${this.locale}`
    );

    return response.data.connected_realms;
  };

  getConnectedRealms = async function () {
    let ConnectedRealmsIndex = await this.getConnectedRealmsIndex();

    let myPromiseArray = [];

    ConnectedRealmsIndex.forEach((realm) => {
      myPromiseArray.push(bai.get(realm.href));
    });

    let ConnectedRealms = await Promise.all(myPromiseArray);

    return ConnectedRealms;
  };

  getProfessionIndex = async function () {
    let response = await this.axiosInstance.get(
      `data/wow/profession/index?namespace=static-us&locale=${this.locale}`
    );

    return response.data.professions;
  };

  getProfessions = async function () {
    let ProfessionsIndex = await this.getProfessionIndex();
    let myPromiseArray = [];

    ProfessionsIndex.forEach((profession) => {
      myPromiseArray.push(bai.get(profession.key.href));
    });

    let Professions = await Promise.all(myPromiseArray);

    return Professions;
  };

  getSkillTiers = async function () {
    let myPromiseArray = [];

    let Professions = await bai.getProfessions();

    Professions.forEach((profession) => {
      if (profession.skill_tiers != null) {
        profession.skill_tiers.forEach((skill_tier) => {
          myPromiseArray.push(bai.get(skill_tier.key.href));
        });
      }
    });

    let SkillTiers = await Promise.all(myPromiseArray);

    return SkillTiers;
  };

  getRecipes = async function () {
    let myPromiseArray = [];

    let SkillTiers = await bai.getSkillTiers();

    SkillTiers.forEach((skillTier) => {
      if (skillTier.categories != null) {
        skillTier.categories.forEach((category) => {
          if (category.recipes != null) {
            category.recipes.forEach((recipe) => {
              myPromiseArray.push(bai.get(recipe.key.href));
            });
          }
        });
      }
    });
    return Promise.all(myPromiseArray);
  };
}

module.exports.AccessToken = AccessToken;
module.exports.BlizzardApiInterface = BlizzardApiInterface;
