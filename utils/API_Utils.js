const BASE_URL = process.env.BASE_URL;

export class API_Utils {
  constructor(apiContext, loginPayLoad) {
    this.apiContext = apiContext;
    this.loginPayLoad = loginPayLoad;
  }

  async getToken() {
    if (this._token) return this._token;
    const loginResponse = await this.apiContext.post(
      `${BASE_URL}/api/ecom/auth/login`,
      { data: this.loginPayLoad },
    );
    const loginResponseJson = await loginResponse.json();
    this._token = loginResponseJson.token;
    return this._token;
  }

  async createOrder(createOrderPayload) {
    const createOrderResponse = await this.apiContext.post(
      `${BASE_URL}/api/ecom/order/create-order`,
      {
        data: createOrderPayload,
        headers: {
          Authorization: await this.getToken(),
          "content-type": "application/json",
        },
      },
    );
    const createOrderResponseJson = await createOrderResponse.json();
    return createOrderResponseJson.orders[0];
  }
}
