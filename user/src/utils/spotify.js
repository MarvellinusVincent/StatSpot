import axios from 'axios';

const LOCALSTORAGE_KEYS = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  expireTime: 'spotify_token_expire_time',
  timestamp: 'spotify_token_timestamp',
};

const LOCALSTORAGE_VALUES = {
  accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
  expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
  timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};

const expiredToken = () => {
  const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES;
  if (!accessToken || !timestamp) {
    return false;
  }
  const millisecondsElapsed = Date.now() - Number(timestamp);
  return (millisecondsElapsed / 1000) > Number(expireTime);
};

const refreshToken = async () => {
  try {
    if (!LOCALSTORAGE_VALUES.refreshToken ||
      LOCALSTORAGE_VALUES.refreshToken === 'undefined' ||
      (Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000) < 1000
    ) {
      console.error('No refresh token available');
      logout();
    }

    const { data } = await axios.get(`/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`);

    window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.access_token);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

    window.location.reload();
  } catch (e) {
    console.error(e);
  }
};

const getAccessToken = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const queryParams = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
  };
  const hasError = urlParams.get('error');

  if (hasError || expiredToken() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
    refreshToken();
  }

  if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
    return LOCALSTORAGE_VALUES.accessToken;
  }

  if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    for (const property in queryParams) {
      window.localStorage.setItem(property, queryParams[property]);
    }
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
    return queryParams[LOCALSTORAGE_KEYS.accessToken];
  }

  return false;
};

export const token = getAccessToken();

if (token) {
  axios.defaults.baseURL = 'https://api.spotify.com/v1';
  axios.defaults.headers.common = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
} else {
  console.error('Token is not available');
}


axios.defaults.baseURL = 'https://api.spotify.com/v1';
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

axios.defaults.headers.common = headers;

export const getCurrentUserProfile = () => {
  return axios.get('/me');
};

export const getCurrentUserPlaylists = (limit = 50) => {
  console.log('getCurrentUserPlaylists parameters:', limit);
  return axios.get(`/me/playlists?limit=${limit}`);
};

export const getTopArtists = (time_range = 'long_term') => {
  console.log('getTopArtists parameters:', time_range);
  return axios.get(`/me/top/artists?time_range=${time_range}&limit=50`);
};

export const getTopArtistsShort = (time_range = 'short_term') => {
  console.log('getTopArtistsShort parameters:', time_range);
  return axios.get(`/me/top/artists?time_range=${time_range}&limit=50`);
};

export const getTopArtistsMedium = (time_range = 'medium_term') => {
  console.log('getTopArtistsMedium parameters:', time_range);
  return axios.get(`/me/top/artists?time_range=${time_range}&limit=50`);
};

export const getTopSongs = (time_range = 'long_term') => {
  console.log('getTopSongs parameters:', time_range);
  return axios.get(`/me/top/tracks?time_range=${time_range}&limit=50`);
};

export const getTopSongsShort = (time_range = 'short_term') => {
  console.log('getTopSongsShort parameters:', time_range);
  return axios.get(`/me/top/tracks?time_range=${time_range}&limit=50`);
};

export const getTopSongsMedium = (time_range = 'medium_term') => {
  console.log('getTopSongsMedium parameters:', time_range);
  return axios.get(`/me/top/tracks?time_range=${time_range}&limit=50`);
};

export const getFollowing = () => {
  return axios.get('/me/following?type=artist');
};

export const getRecentlyPlayed = () => {
  return axios.get('/me/player/recently-played?limit=50');
};

export const getPlaylists = () => {
  return axios.get('/me/playlists?limit=50');
};

export const getArtist = artistId => {
  console.log('getArtist parameters:', artistId);
  return axios.get(`/artists/${artistId}`);
};

export const getPlaylist = playlistId => {
  console.log('getPlaylist parameters:', playlistId);
  return axios.get(`/playlists/${playlistId}`);
};

export const getMultipleTrackAudioFeatures = ids => {
  console.log('getMultipleTrackAudioFeatures parameters:', ids);
  return axios.get(`/audio-features?ids=${ids}`);
};

export const getTrackAudioFeatures = trackId => {
  console.log('getTrackAudioFeatures parameters:', trackId);
  return axios.get(`/audio-features/${trackId}`);
};

export const getRecommendationsForTracks = tracks => {
  console.log('getRecommendationsForTracks parameters:', tracks);
  const shuffledTracks = tracks.sort(() => 0.5 - Math.random());
  const seed_tracks = getTrackIds(shuffledTracks.slice(0, 5));
  const seed_artists = '';
  const seed_genres = '';
  return axios.get(`/recommendations?seed_tracks=${seed_tracks}&seed_artists=${seed_artists}&seed_genres=${seed_genres}`);
};

export const addTrackToPlaylist = (playlistId, uris) => {
  console.log('addTrackToPlaylist parameters:', playlistId, uris);
  const data = {
    position: 0
  };
  axios.post(`/playlists/${playlistId}/tracks?uris=spotify:track:${uris}`, data);
};

export const getTrack = trackId => {
  console.log('getTrack parameters:', trackId);
  return axios.get(`/tracks/${trackId}`);
};

const getTrackIds = tracks => tracks.map(({ track }) => track.id).join(',');

export const getTrackAudioAnalysis = trackId => {
  console.log('getTrackAudioAnalysis parameters:', trackId);
  return axios.get(`/audio-analysis/${trackId}`);
};

export const getTrackInfo = trackId => {
  console.log('getTrackInfo parameters:', trackId);
  return axios
    .all([getTrack(trackId), getTrackAudioAnalysis(trackId), getTrackAudioFeatures(trackId)])
    .then(
      axios.spread((track, audioAnalysis, audioFeatures) => ({
        track: track.data,
        audioAnalysis: audioAnalysis.data,
        audioFeatures: audioFeatures.data,
      })),
    );
};

export const removeTrackFromPlaylist = (playlistId, uris) => {
  console.log('removeTrackFromPlaylist parameters:', playlistId, uris);
  const trackUris = Array.isArray(uris) ? uris : [uris];

  const data = {
    tracks: trackUris.map(uri => ({
      uri: `spotify:track:${uri}`
    }))
  };
  console.log('Track IDs from spotify.js:', trackUris);
  console.log('Playlist ID from spotify.js:', playlistId);
  console.log('Data:', data);
  axios.post(`/playlists/${playlistId}/tracks`, data);
};

export const logout = () => {
  for (const property in LOCALSTORAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
  }
  window.location = window.location.origin;
};