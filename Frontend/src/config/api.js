const getApiBaseUrl = () => {
  return window.location.origin;  
};

export const API_BASE_URL = getApiBaseUrl();
  
  export const API_ENDPOINTS = {
    transferSam: `${API_BASE_URL}/chat/transferSam`,
    ayush: `${API_BASE_URL}/chat/ayush`,
    mdToFront: `${API_BASE_URL}/chat/mdToFront`,
    panelData: `${API_BASE_URL}/chat/panel_data`,
    generateComic: `${API_BASE_URL}/chat/generateComic`,
    transferNar2nar: `${API_BASE_URL}/chat/transferNar2nar`,
    transferSt2nar: `${API_BASE_URL}/chat/transferSt2nar`,
    login: `${API_BASE_URL}/user/login`,
    signup: `${API_BASE_URL}/user/signup`,
    googleAuth: `${API_BASE_URL}/user/auth/google`
  };
  