const API_BASE = "http://127.0.0.1:8085/labels";

export const getLabels = async () => {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error("Failed to fetch labels");
  return response.json();
};

export const createLabel = async (labelData) => {
  console.log("API Request - Body:", JSON.stringify(labelData)); // Debug log
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(labelData),
  });
  if (!response.ok) throw new Error("Failed to create label");
  return response.json();
};

export const updateLabel = async (id, name) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Failed to update label");
  return response.json();
};

export const deleteLabel = async (id) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete label");
  return response.json();
};
