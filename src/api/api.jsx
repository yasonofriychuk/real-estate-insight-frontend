import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5001/api/v1',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

// Infrastructure: Heatmap
export async function fetchInfrastructureHeatmap({ bbox, selectionId }) {
  const {
    topLeftLat,
    topLeftLon,
    bottomRightLat,
    bottomRightLon,
  } = bbox;

  if (!topLeftLat || !topLeftLon || !bottomRightLat || !bottomRightLon) {
    throw new Error('Bounding box coordinates are required.');
  }

  const payload = {
    bbox: {
      topLeftLat,
      topLeftLon,
      bottomRightLat,
      bottomRightLon,
    },
    selectionId: selectionId,
  };

  try {
    const response = await api.post('/infrastructure/heatmap', payload);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Developments: Filtered search
export async function searchDevelopments({ board, selectionId, searchQuery }) {
  const { topLeftLat, topLeftLon, bottomRightLat, bottomRightLon } = board;
  if (!topLeftLat || !topLeftLon || !bottomRightLat || !bottomRightLon) {
    throw new Error('Board coordinates are required.');
  }

  const payload = { board, selectionId, searchQuery };
  try {
    const response = await api.post('/developments/search', payload);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Получение подборки по selectionId
export async function getSelectionById(selectionId) {
  if (!selectionId) {
    throw new Error('selectionId is required.');
  }

  try {
    const response = await api.get(`/selection/${selectionId}`);
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

// Auth: Login
export async function loginUser(email, password) {
  try {
    const response = await api.post('/profile/login', { email, password });
    const { token, profile_id } = response.data;
    return { token, profile_id };
  } catch (error) {
    handleApiError(error);
  }
}

// Selections: List
export async function fetchSelections() {
  try {
    const response = await api.get('/selection/list');
    return response.data.selections;
  } catch (error) {
    handleApiError(error);
  }
}

// Selections: Create
export async function createSelection({ name, comment, form }) {
  try {
    const response = await api.post('/selection/create', { name, comment, form });
    return response.data.selectionId;
  } catch (error) {
    handleApiError(error);
  }
}

// Selections: Delete
export async function deleteSelection(selectionId) {
  try {
    const response = await api.post('/selection/delete', null, {
      params: { id: selectionId },
    });
    return response.data.status;
  } catch (error) {
    handleApiError(error);
  }
}

// Selections: Edit
export async function editSelection({ selectionId, name, comment, form }) {
  try {
    const response = await api.post('/selection/edit', {
      selectionId,
      name,
      comment,
      form,
    });
    return response.data.status;
  } catch (error) {
    handleApiError(error);
  }
}

// Selections: Favorite (Add/Remove development)
export async function toggleFavoriteSelection(selection_id, development_id, value) {
  try {
    const response = await api.post('/selection/favorite', {
      selection_id,
      development_id,
      value
    });
    return response.data.status;
  } catch (error) {
    handleApiError(error);
  }
}

// Locations: List
export async function fetchLocationList() {
  try {
    const response = await api.get('/location/list');
    return response.data.locations;
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
