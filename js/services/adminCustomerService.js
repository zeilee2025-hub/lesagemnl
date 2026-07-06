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

async function parseAdminCustomerResponse(
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

export async function getAdminCustomers() {

  const token =
    await getAdminToken();

  const response =
    await fetch(
      `${API_BASE_URL}/admin/customers`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  return parseAdminCustomerResponse(
    response,
    "Failed to load customers"
  );

}

export async function getAdminCustomerDetail(
  customerKey
) {

  const token =
    await getAdminToken();

  const response =
    await fetch(
      `${API_BASE_URL}/admin/customers/${encodeURIComponent(customerKey)}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  return parseAdminCustomerResponse(
    response,
    "Failed to load customer"
  );

}
