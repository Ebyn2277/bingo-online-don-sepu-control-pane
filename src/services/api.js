const endpoint = import.meta.env.VITE_API_URL;
const BINGO_ID = import.meta.env.VITE_BINGO_ID;

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const getAuthHeaders = (token) => ({
  ...headers,
  Authorization: `Bearer ${token}`,
});

const apiFetch = async (url, options = {}) => {
  try {
    const response = await fetch(endpoint + url, options);
    console.log(`${options.method || "GET"} ${url}:`, response);
    return response;
  } catch (error) {
    console.error(`Error on ${url}:`, error);
    throw error;
  }
};

export const authService = {
  login: async (email, password) => {
    return apiFetch("admin/login", {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        password,
      }),
    });
  },

  logout: async (token) => {
    return apiFetch("admin/logout", {
      method: "GET",
      headers: getAuthHeaders(token),
    });
  },
};

export const bingoService = {
  getInfo: async (token) => {
    return apiFetch("bingo/get/admin", {
      method: "GET",
      headers: getAuthHeaders(token),
    });
  },

  updateInfo: async (token, bingoData) => {
    return apiFetch("bingo/update", {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(bingoData),
    });
  },

  reset: async (token) => {
    return apiFetch("bingo/reset", {
      method: "POST",
      headers: getAuthHeaders(token),
    });
  },
};

export const linesService = {
  getCurrent: async (token) => {
    return apiFetch("lines/current/admin?bingo_id=" + BINGO_ID, {
      method: "GET",
      headers: getAuthHeaders(token),
    });
  },

  updateState: async (token, purchases, bingoId = BINGO_ID) => {
    return apiFetch("lines/update", {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ bingo_id: bingoId, purchases }),
    });
  },

  cancelPurchase: async (token, purchaseIds, bingoId = BINGO_ID) => {
    return apiFetch("lines", {
      method: "DELETE",
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        purchase_ids: purchaseIds,
        bingo_id: bingoId,
      }),
    });
  },
};
