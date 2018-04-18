// @flow

import { Map } from 'immutable';
import type { ImageGallery } from '../../models/ImageGallery';
import {
  imageGalleriesReducer,
  selectGalleries,
  selectGalleryWithId,
  selectGalleryWithName,
  selectGalleryProcessingType,
  selectGalleryListProcessingType,
} from '../image_galleries_reducer';
import type {
  ImageGalleryListState,
} from '../image_galleries_reducer';

const EMPTY_STATE = {
  processing: null,
  galleries: new Map(),
  error: null,
};

const ERROR = { message: 'error message' };

const GALLERY_INFO_1 : ImageGallery = {
  createdOn: '12/1/2018',
  description: 'a description for 5',
  id: 5,
  name: 'jdoe_gallery5',
  nbImages: 0,
  updatedOn: '12/2/2018',
};

const GALLERY_INFO_2 : ImageGallery = {
  createdOn: '12/1/2017',
  description: 'a description for 6',
  id: 6,
  name: 'jdoe_gallery6',
  nbImages: 0,
  updatedOn: '12/2/2017',
};

describe('image_galleries_reducer', () => {
  describe('selectors', () => {
    let state;

    beforeEach(() => {
      state = {
        processing: null,
        error: null,
        galleries: Map({
          gallery_6: {
            processing: null,
            error: null,
            gallery: GALLERY_INFO_1,
          },
          gallery_5: {
            processing: null,
            error: null,
            gallery: GALLERY_INFO_2,
          },
        }),
      };
    });

    describe('selectGalleries', () => {
      it('returns content of state', () => {
        expect(selectGalleries(state)).toEqual([GALLERY_INFO_1, GALLERY_INFO_2]);
      });
    });

    describe('selectGalleryWithId', () => {
      it('returns gallery if it exists', () => {
        expect(selectGalleryWithId(state, 5)).toEqual(GALLERY_INFO_2);
      });

      it('returns null if it does not exist', () => {
        expect(selectGalleryWithId(state, 52)).toEqual(null);
      });
    });

    describe('selectGalleryWithName', () => {
      it('returns gallery if it exists', () => {
        expect(selectGalleryWithName(state, GALLERY_INFO_2.name)).toEqual(GALLERY_INFO_2);
      });

      it('returns null if it does not exist', () => {
        expect(selectGalleryWithName(state, 'blblala')).toEqual(null);
      });

      it('returns null if name is null', () => {
        expect(selectGalleryWithName(state, null)).toEqual(null);
      });
    });

    describe('selectGalleryProcessingType', () => {
      it('returns true when gallery is loading', () => {
        expect(selectGalleryProcessingType(state, 6)).toEqual(null);
      });

      it('returns false when gallery is not loading', () => {
        expect(selectGalleryProcessingType(state, 5)).toEqual(null);
      });

      it('returns false when gallery does not exist', () => {
        expect(selectGalleryProcessingType(state, 25)).toEqual(null);
      });
    });

    describe('selectGalleryListProcessingType', () => {
      it('returns true when gallery is loading', () => {
        expect(selectGalleryListProcessingType(state)).toEqual(null);
      });

      it('returns false when gallery is not loading', () => {
        const testState = { ...state, processing: 'add' };
        expect(selectGalleryListProcessingType(testState)).toEqual('add');
      });
    });
  });

  describe('imageGalleriesReducer', () => {
    it('initializes with proper value', () => {
      expect(imageGalleriesReducer(undefined, { type: 'IMAGE_GALLERY_SCRATCH_REINIT_LOCAL' })).toEqual(EMPTY_STATE);
    });

    describe('when state is empty', () => {
      it('processes unsupported action type', () => {
        expect(imageGalleriesReducer(EMPTY_STATE, { type: 'IMAGE_GALLERY_SCRATCH_REINIT_LOCAL' }))
          .toEqual(EMPTY_STATE);
      });

      it('processes IMAGE_GALLERY_LIST_REQUEST correctly', () => {
        expect(imageGalleriesReducer(EMPTY_STATE, { type: 'IMAGE_GALLERY_LIST_REQUEST' })).toEqual({
          processing: 'fetch',
          error: null,
          galleries: Map(),
        });
      });

      it('processes IMAGE_GALLERY_LIST_RESPONSE_ERROR correctly', () => {
        const startState = { processing: 'fetch', error: null, galleries: Map() };
        const expectedState = { processing: null, error: ERROR, galleries: Map() };

        expect(imageGalleriesReducer(
          startState,
          { type: 'IMAGE_GALLERY_LIST_RESPONSE_ERROR', error: ERROR },
        )).toEqual(expectedState);
      });

      it('processes IMAGE_GALLERY_LIST_RESPONSE_OK correctly', () => {
        const galleries = [GALLERY_INFO_1, GALLERY_INFO_2];
        const startState = { processing: 'fetch', error: null, galleries: Map() };
        const expectedState = {
          processing: null,
          error: null,
          galleries: Map({
            gallery_5: {
              processing: null,
              error: null,
              gallery: GALLERY_INFO_1,
            },
            gallery_6: {
              processing: null,
              error: null,
              gallery: GALLERY_INFO_2,
            },
          }) };

        expect(imageGalleriesReducer(
          startState,
          { type: 'IMAGE_GALLERY_LIST_RESPONSE_OK', galleries },
        )).toEqual(expectedState);
      });

      it('processes IMAGE_GALLERY_CREATE_REQUEST', () => {
        const startState = { processing: null, error: null, galleries: Map() };
        const expectedState = {
          processing: 'add',
          error: null,
          galleries: Map(),
        };

        expect(imageGalleriesReducer(startState, {
          type: 'IMAGE_GALLERY_CREATE_REQUEST',
        })).toEqual(expectedState);
      });

      it('processes IMAGE_GALLERY_CREATE_RESPONSE_OK', () => {
        const startState : ImageGalleryListState = {
          processing: 'add',
          error: null,
          galleries: Map(),
        };
        const expectedState : ImageGalleryListState = {
          processing: null,
          error: null,
          galleries: Map({
            gallery_5: {
              processing: null,
              error: null,
              gallery: GALLERY_INFO_1,
            },
          }),
        };

        expect(imageGalleriesReducer(startState, {
          type: 'IMAGE_GALLERY_CREATE_RESPONSE_OK',
          gallery: GALLERY_INFO_1,
        })).toEqual(expectedState);
      });

      it('processes IMAGE_GALLERY_CREATE_RESPONSE_ERROR', () => {
        const startState = { processing: 'add', error: null, galleries: Map() };
        const expectedState = { processing: null, error: ERROR, galleries: Map() };

        expect(imageGalleriesReducer(startState, {
          type: 'IMAGE_GALLERY_CREATE_RESPONSE_ERROR',
          error: ERROR,
        })).toEqual(expectedState);
      });
    });

    describe('when state has one gallery', () => {
      let startState;

      beforeAll(() => {
        startState = {
          processing: null,
          error: null,
          galleries: Map({
            gallery_5: {
              processing: null,
              error: null,
              gallery: GALLERY_INFO_1,
            },
          }),
        };
      });

      it('processes IMAGE_GALLERY_LIST_DELETE_REQUEST', () => {
        const expectedState : ImageGalleryListState = {
          processing: null,
          error: null,
          galleries: Map({
            gallery_5: {
              processing: 'delete',
              error: null,
              gallery: GALLERY_INFO_1,
            },
          }),
        };

        expect(imageGalleriesReducer(
          startState,
          { type: 'IMAGE_GALLERY_DELETE_REQUEST', galleryId: 5 },
        )).toEqual(expectedState);
      });

      it('processes IMAGE_GALLERY_LIST_DELETE_RESPONSE_ERROR', () => {
        const expectedState : ImageGalleryListState = {
          processing: null,
          error: null,
          galleries: Map({
            gallery_5: {
              processing: null,
              error: ERROR,
              gallery: GALLERY_INFO_1,
            },
          }),
        };

        expect(imageGalleriesReducer(
          startState,
          { type: 'IMAGE_GALLERY_DELETE_RESPONSE_ERROR', galleryId: 5, error: ERROR },
        )).toEqual(expectedState);
      });

      it('processes IMAGE_GALLERY_LIST_DELETE_RESPONSE_OK', () => {
        const expectedState : ImageGalleryListState = {
          processing: null,
          error: null,
          galleries: Map(),
        };

        expect(imageGalleriesReducer(
          startState,
          { type: 'IMAGE_GALLERY_DELETE_RESPONSE_OK', galleryId: 5 },
        )).toEqual(expectedState);
      });

      it('processes IMAGE_GALLERY_UPDATE_REQUEST', () => {
        const expectedState = {
          processing: null,
          error: null,
          galleries: Map({
            gallery_5: {
              processing: 'update',
              error: null,
              gallery: GALLERY_INFO_1,
            },
          }),
        };

        expect(imageGalleriesReducer(startState, {
          type: 'IMAGE_GALLERY_UPDATE_REQUEST',
          galleryId: 5,
        })).toEqual(expectedState);
      });

      it('processes IMAGE_GALLERY_UPDATE_RESPONSE_ERROR', () => {
        const expectedState = {
          processing: null,
          error: null,
          galleries: Map({
            gallery_5: {
              processing: null,
              error: ERROR,
              gallery: GALLERY_INFO_1,
            },
          }),
        };

        expect(imageGalleriesReducer(startState, {
          type: 'IMAGE_GALLERY_UPDATE_RESPONSE_ERROR',
          galleryId: 5,
          error: ERROR,
        })).toEqual(expectedState);
      });

      it('processes IMAGE_GALLERY_UPDATE_RESPONSE_OK', () => {
        const newGallery = { ...GALLERY_INFO_1, description: 'a new description' };

        const expectedState = {
          processing: null,
          error: null,
          galleries: Map({
            gallery_5: {
              processing: null,
              error: null,
              gallery: newGallery,
            },
          }),
        };

        expect(imageGalleriesReducer(startState, {
          type: 'IMAGE_GALLERY_UPDATE_RESPONSE_OK',
          gallery: newGallery,
        })).toEqual(expectedState);
      });
    });
  });
});
