// @flow

import axios from 'axios';

let axiosInstance : axios = null;

export function setMediaGalleryCommunicatorInstance(instance : axios) {
  axiosInstance = instance;
}

export function mediaGalleryCommunicator() : axios {
  return axiosInstance;
}
