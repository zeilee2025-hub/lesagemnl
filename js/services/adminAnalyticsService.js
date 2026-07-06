import { auth }
from "../core/firebase.js";

import { API_BASE_URL }
from "./config/api.js";

async function getAdminToken() {

  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "Admin not authenticated"
    );
  }

  return user.getIdToken();

}

async function parseAnalyticsResponse(
  response,
  fallbackMessage
) {

  const data =
    await response.json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
      fallbackMessage
    );
  }

  return data;

}

export async function getAdminAnalytics(
  range = "30D"
) {

  const token =
    await getAdminToken();

  const safeRange =
    ["7D", "30D", "90D", "ALL"].includes(range)
      ? range
      : "30D";

  const response =
    await fetch(
      `${API_BASE_URL}/admin/analytics?range=${encodeURIComponent(safeRange)}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  return parseAnalyticsResponse(
    response,
    "Failed to load analytics"
  );

}
