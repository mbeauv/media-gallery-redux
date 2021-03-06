// @flow

import { Map } from 'immutable';
import type { ImageGallery } from '../models/ImageGallery';
import type { MediaGalleryAction } from '../actions/types';

/**  Operations allowed on an image galleries collection. */
export type ImageGalleryOperation = 'delete' | 'update' | 'fetch';

/**  Operations allowed on an image gallery collection. */
export type ImageGalleriesOperation = 'add' | 'delete' | 'fetch';

/** State of one particular image gallery. */
export type ImageGalleryState = {
  +processing: ?ImageGalleryOperation,
  +error: ?Object,
  +gallery: ImageGallery,
};

/** State of all of the galleries associated to user. */
export type ImageGalleryListState = {
  +processing: ?ImageGalleriesOperation,
  +error: ?Object,
  +galleries: Map<string, ImageGalleryState>,
}

type MergeDeepType = {|
  +processing?: ?ImageGalleryOperation,
  +error?: ?Object,
  +gallery?: ImageGallery,
|};

const galleryIndex = (galleryId: number) => `gallery_${galleryId}`;

const createGalleryState = (gallery: ImageGallery) : ImageGalleryState =>
  ({ processing: null, error: null, gallery });

const createGalleries = (galleries : Array<ImageGallery>) : Map<string, ImageGalleryState> =>
  (Map(galleries.map(item => [galleryIndex(item.id), createGalleryState(item)])));

const INITIAL_STATE : ImageGalleryListState = {
  processing: null,
  error: null,
  galleries: new Map(),
};

function mergeGallery(
  state: ImageGalleryListState,
  galleryId: number,
  attribs: MergeDeepType,
) : ImageGalleryListState {
  return {
    ...state,
    galleries: state.galleries.mergeDeep({
      [galleryIndex(galleryId)]: attribs,
    }) };
}

export function imageGalleriesReducer(
  state: ImageGalleryListState = INITIAL_STATE,
  action: MediaGalleryAction,
) : ImageGalleryListState {
  switch (action.type) {
    case 'IMAGE_GALLERY_DELETE_REQUEST':
      return mergeGallery(state, action.galleryId, { processing: 'delete', error: null });
    case 'IMAGE_GALLERY_DELETE_RESPONSE_ERROR':
      return mergeGallery(state, action.galleryId, { processing: null, error: action.error });
    case 'IMAGE_GALLERY_DELETE_RESPONSE_OK':
      return {
        ...state,
        galleries: state.galleries.remove(galleryIndex(action.galleryId)),
      };
    case 'IMAGE_GALLERY_UPDATE_REQUEST':
      return mergeGallery(state, action.galleryId, { processing: 'update', error: null });
    case 'IMAGE_GALLERY_UPDATE_RESPONSE_ERROR':
      return mergeGallery(state, action.galleryId, { processing: null, error: action.error });
    case 'IMAGE_GALLERY_UPDATE_RESPONSE_OK':
      return mergeGallery(state, action.gallery.id, {
        processing: null,
        error: null,
        gallery: action.gallery });
    case 'IMAGE_GALLERY_CREATE_REQUEST':
      return { ...state, processing: 'add', error: null };
    case 'IMAGE_GALLERY_CREATE_RESPONSE_ERROR':
      return { ...state, processing: null, error: action.error, galleries: Map() };
    case 'IMAGE_GALLERY_CREATE_RESPONSE_OK':
      return {
        ...state,
        processing: null,
        error: null,
        galleries:
          state.galleries.set(galleryIndex(action.gallery.id), createGalleryState(action.gallery)),
      };
    case 'IMAGE_GALLERY_LIST_REQUEST':
      return { ...state, processing: 'fetch', error: null, galleries: Map() };
    case 'IMAGE_GALLERY_LIST_RESPONSE_OK':
      return { ...state, processing: null, galleries: createGalleries(action.galleries) };
    case 'IMAGE_GALLERY_LIST_RESPONSE_ERROR':
      return { ...state, processing: null, error: action.error, galleries: Map() };
    default:
      return state;
  }
}

/**
 * Selector returning an array of all galleries in the reducer.
 */
export const selectGalleries = (state: ImageGalleryListState) : Array<ImageGallery> => (
  state.galleries.map(g => g.gallery).toIndexedSeq().toArray()
);

/**
 * Selector returning a map of all galleries by names.
 */
export const selectGalleriesByName = (state: ImageGalleryListState) : Map<string, ImageGallery> => {
  const values = [];
  state.galleries.forEach(g => values.push([g.gallery.name, g.gallery]));
  return Map(values);
};

/**  Returns map of galleries organized by their id.  */
export const selectGalleriesById = (state: ImageGalleryListState) : Map<number, ImageGallery> => {
  const values = [];
  state.galleries.forEach(g => values.push([g.gallery.id, g.gallery]));
  return Map(values);
};

/** Returns the gallery with the given id, null returned if not found. */
export function selectGalleryWithId(state: ImageGalleryListState, galleryId: number)
  : ?ImageGallery {
  const gallery = state.galleries.get(galleryIndex(galleryId));
  return gallery ? gallery.gallery : null;
}

/** Returns current operation being processed on gallery.  Null if no operation. */
export function selectGalleryProcessingType(state: ImageGalleryListState, galleryId: number)
  : ?ImageGalleryOperation {
  const gallery = state.galleries.get(galleryIndex(galleryId));
  return gallery ? gallery.processing : null;
}

/** Returns current error associated to gallery. Null if no error. */
export function selectGalleryError(state: ImageGalleryListState, galleryId: number)
: ?Object {
  const gallery = state.galleries.get(galleryIndex(galleryId));
  return gallery ? gallery.error : null;
}

/** Returns current operation being processed on a gallery collrection.  Null if no operation. */
export function selectGalleriesProcessingType(state: ImageGalleryListState) {
  return state.processing;
}

/** Returns current error object associated to the gallery collection. */
export function selectGalleryListError(state: ImageGalleryListState) : ?Object {
  return state.error;
}
