// apiClient.js
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:5001/api/v1';
const api = axios.create({ baseURL: BASE_URL });

// Infrastructure: Get objects around a development
export async function fetchInfrastructureRadius(developmentId, radius) {
  if (radius < 1000 || radius > 10000) {
    throw new Error('Radius must be between 1000 and 10000.');
  }

  try {
    const response = await api.get('/infrastructure/radius', {
      params: { developmentId, radius },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Developments: Filtered search
export async function searchDevelopments({
  board: {
    topLeftLat,
    topLeftLon,
    bottomRightLat,
    bottomRightLon,
  },
}) {
  if (!topLeftLat || !topLeftLon || !bottomRightLat || !bottomRightLon) {
    throw new Error('Board coordinates are required.');
  }

  const payload = {
    board: {
      topLeftLat,
      topLeftLon,
      bottomRightLat,
      bottomRightLon,
    },
  };

  try {
    const response = await api.post('/developments/search/filter', payload);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Routes: Build a route between development and OSM point
export async function buildRouteBetweenPoints(developmentId, osmId) {
  try {
    const response = await api.get('/routes/build/points', {
      params: { developmentId, osmId },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Generic error handler
function handleApiError(error) {
  if (axios.isAxiosError(error) && error.response) {
    const { status } = error.response;
    const message = error.response?.data?.error?.message || 'Unknown error';

    switch (status) {
      case 400:
        throw new Error(`Bad Request: ${message}`);
      case 404:
        throw new Error(`Not Found: ${message}`);
      case 500:
        throw new Error(`Server Error: ${message}`);
      default:
        throw new Error(`Unexpected error (${status}): ${message}`);
    }
  } else {
    throw new Error('Network or unknown error.');
  }
}
