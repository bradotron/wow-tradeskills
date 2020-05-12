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
  }

  tokenUrl = `https://us.battle.net/oauth/token`;

  initialize = new Promise((resolve, reject) => {
    axios({
      method: "post",
      url: this.tokenUrl,
      auth: {
        username: process.env.BLIZZARD_CLIENT_ID,
        password: process.env.BLIZZARD_CLIENT_SECRET,
      },
      params: {
        grant_type: "client_credentials",
      },
    })
      .then((res) => {
        this.accessToken = new AccessToken(
          res.data.access_token,
          res.data.token_type,
          res.data.expires_in
        );
        this.axiosInstance = axios.create({
          baseURL: 'https://some-domain.com/api/',
          timeout: 1000,
          headers: {'Authorization': `Bearer ${this.accessToken.accessToken}`}
        });
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports.AccessToken = AccessToken;
module.exports.BlizzardApiInterface = BlizzardApiInterface;
