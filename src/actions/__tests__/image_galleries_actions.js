// @flow

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { setMediaGalleryCommunicatorInstance } from '../communicator';
import {
  getImageGalleries,
  createImageGallery,
  updateImageGallery,
  deleteImageGallery,
} from '../image_galleries_actions';


const AUTH_TOKEN = 'atoken';
const GALLERY1_ID = 5;
const GALLERY1_NAME = 'jdoe_gallery';
const GALLERY1_DESCRIPTION = 'jdoe gallery description';
const GALLERY2_ID = 6;
const GALLERY2_NAME = 'jdoe_gallery22';
const GALLERY1 = {
  id: GALLERY1_ID,
  name: GALLERY1_NAME,
  description: GALLERY1_DESCRIPTION,
  nbImages: 1,
  createdAt: '123',
};
const GALLERY2 = { id: GALLERY2_ID, name: GALLERY2_NAME, nbImages: 0, createdAt: '123' };
const GALLERIES = [GALLERY1, GALLERY2];

const mock = new MockAdapter(axios);
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('image_galleries_actions', () => {
  beforeEach(() => setMediaGalleryCommunicatorInstance(mock.axiosInstance));

  let store;

  beforeEach(() => {
    store = mockStore();
  });

  afterEach(() => mock.reset());

  describe('deleteImageGallery', () => {
    it('handles failed deletion', () => {
      mock.onDelete(`/media_gallery/galleries/${GALLERY1_ID}.json?auth_token=${AUTH_TOKEN}`).reply(500);

      const expectedActions = [
        { type: 'IMAGE_GALLERY_DELETE_REQUEST', galleryId: GALLERY1_ID },
        { type: 'IMAGE_GALLERY_DELETE_RESPONSE_ERROR', galleryId: GALLERY1_ID, error: expect.anything() },
      ];

      return store.dispatch(deleteImageGallery(AUTH_TOKEN, GALLERY1_ID)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });


    it('handles successful deletion', () => {
      mock.onDelete(`/media_gallery/galleries/${GALLERY1_ID}.json?auth_token=${AUTH_TOKEN}`).reply(200);

      const expectedActions = [
        { type: 'IMAGE_GALLERY_DELETE_REQUEST', galleryId: GALLERY1_ID },
        { type: 'IMAGE_GALLERY_DELETE_RESPONSE_OK', galleryId: GALLERY1_ID },
      ];

      return store.dispatch(deleteImageGallery(AUTH_TOKEN, GALLERY1_ID)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('updateImageGallery', () => {
    it('handles failed update', () => {
      mock.onPut(`/media_gallery/galleries/${GALLERY1_ID}.json?auth_token=${AUTH_TOKEN}`, {
        name: GALLERY1_NAME,
        description: GALLERY1_DESCRIPTION,
      }).reply(500);


      const expectedActions = [
        { type: 'IMAGE_GALLERY_UPDATE_REQUEST', galleryId: GALLERY1_ID },
        { type: 'IMAGE_GALLERY_UPDATE_RESPONSE_ERROR', galleryId: GALLERY1_ID, error: expect.anything() },
      ];

      return store.dispatch(updateImageGallery(
        AUTH_TOKEN,
        GALLERY1_ID,
        GALLERY1_NAME,
        GALLERY1_DESCRIPTION,
      )).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('handles successful update', () => {
      mock.onPut(`/media_gallery/galleries/${GALLERY1_ID}.json?auth_token=${AUTH_TOKEN}`, {
        name: GALLERY1_NAME,
        description: GALLERY1_DESCRIPTION,
      }).reply(200, GALLERY1);


      const expectedActions = [
        { type: 'IMAGE_GALLERY_UPDATE_REQUEST', galleryId: GALLERY1_ID },
        { type: 'IMAGE_GALLERY_UPDATE_RESPONSE_OK', gallery: GALLERY1 },
      ];

      return store.dispatch(updateImageGallery(
        AUTH_TOKEN,
        GALLERY1_ID,
        GALLERY1_NAME,
        GALLERY1_DESCRIPTION,
      )).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('createImageGallery', () => {
    it('handles failed creation', () => {
      mock.onPost(`/media_gallery/galleries.json?auth_token=${AUTH_TOKEN}`, {
        name: GALLERY1_NAME,
        description: GALLERY1_DESCRIPTION,
      }).reply(500);

      const expectedActions = [
        { type: 'IMAGE_GALLERY_CREATE_REQUEST', galleryName: GALLERY1_NAME, galleryDescription: GALLERY1_DESCRIPTION },
        { type: 'IMAGE_GALLERY_CREATE_RESPONSE_ERROR', error: expect.anything() },
      ];

      return store.dispatch(createImageGallery(
        AUTH_TOKEN,
        GALLERY1_NAME,
        GALLERY1_DESCRIPTION,
      )).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('handles successful creation', () => {
      mock.onPost(`/media_gallery/galleries.json?auth_token=${AUTH_TOKEN}`, {
        name: GALLERY1_NAME,
        description: GALLERY1_DESCRIPTION,
      }).reply(200, GALLERY1);


      const expectedActions = [
        { type: 'IMAGE_GALLERY_CREATE_REQUEST', galleryName: GALLERY1_NAME, galleryDescription: GALLERY1_DESCRIPTION },
        { type: 'IMAGE_GALLERY_CREATE_RESPONSE_OK', gallery: GALLERY1 },
      ];

      return store.dispatch(createImageGallery(
        AUTH_TOKEN,
        GALLERY1_NAME,
        GALLERY1_DESCRIPTION,
      )).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('getImageGalleries', () => {
    it('handles successful fetch', () => {
      mock.onGet(`/media_gallery/galleries.json?auth_token=${AUTH_TOKEN}`).reply(200, GALLERIES);

      const expectedActions = [
        { type: 'IMAGE_GALLERY_LIST_REQUEST' },
        { type: 'IMAGE_GALLERY_LIST_RESPONSE_OK', galleries: GALLERIES },
      ];

      return store.dispatch(getImageGalleries(AUTH_TOKEN)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
