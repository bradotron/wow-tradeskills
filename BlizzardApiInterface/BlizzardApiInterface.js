axios = require("axios");

class AccessToken {
  constructor(accessToken, tokenType, expiresIn) {
    this.accessToken = accessToken;
    this.tokenType = tokenType;
    this.expiresIn = expiresIn;
    this.createdAt = Date.now();
  }
}

class BlizzardApiInterface {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.axiosInstance = null;
    this.namespace = "dynamic-us";
    this.locale = "en_US";
  }

  initialize = function () {
    console.log("initialize start");
    return new Promise((resolve, reject) => {
      this.getToken().then((res) => {
        console.log("resolve getToken");
        this.accessToken = new AccessToken(
          res.data.access_token,
          res.data.token_type,
          res.data.expires_in
        );
        this.setAxiosInstance();
        resolve(true);
      });
    });
  };

  getToken = function () {
    return axios({
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
  };

  getConnectedRealmsIndex = async function () {
    let dataPromise = new Promise((resolve, reject) => {
      this.axiosInstance
        .get(
          `data/wow/connected-realm/index?namespace=${this.namespace}&local=${this.locale}`
        )
        .then((result) => {
          resolve(result.data);
        })
        .catch((error) => reject(error));
    });
    let data = await dataPromise;
    return data;
  };

  setAxiosInstance = function () {
    this.axiosInstance = axios.create({
      baseURL: "https://us.api.blizzard.com",
      timeout: 1000,
      headers: {
        Authorization: `Bearer ${this.accessToken.accessToken}`,
        "If-Modified-Since": "header",
      },
    });
  };
}

module.exports.AccessToken = AccessToken;
module.exports.BlizzardApiInterface = BlizzardApiInterface;
