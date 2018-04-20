// @flow

import axios from 'axios';

let axiosInstance : axios = null;

export const setMediaGalleryCommunicator = (inst : axios) : void => { axiosInstance = inst; };

export const mediaGalleryCommunicator = () : axios => axiosInstance;
