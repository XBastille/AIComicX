const getApiBaseUrl = () => {
  return window.location.origin;
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  //Sam_Route
  transferSam: `${API_BASE_URL}/sam/transferSam`,

  //Chat_Route
  ayush: `${API_BASE_URL}/chat/ayush`,
  mdToFront: `${API_BASE_URL}/chat/mdToFront`,

  //Panel_Route
  panelData: `${API_BASE_URL}/panel/panel_data`,
  get_panel_prompt: `${API_BASE_URL}/panel/get_panel_prompt`,

  //Comic_Route
  generateComic: `${API_BASE_URL}/comic/generateComic`,
  regenerateComic: `${API_BASE_URL}/comic/regenerateComic`,

  //pdf_Story_Route
  transferNar2nar: `${API_BASE_URL}/story/transferNar2nar`,
  transferSt2nar: `${API_BASE_URL}/story/transferSt2nar`,

  //Auth_Route
  login: `${API_BASE_URL}/user/login`,
  signup: `${API_BASE_URL}/user/signup`,
  googleAuth: `${API_BASE_URL}/user/auth/google`,
};
