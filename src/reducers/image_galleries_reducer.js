// @flow

import { Map } from 'immutable';
import type { ImageGallery } from '../models/ImageGallery';
import type { MediaGalleryAction } from '../actions/types';

/**
 * These are the possible operations that can be made on a gallery.  Note
 * that there is no 'add' operation.  The 'add' operation is done prior
 * to adding the gallery to the reducer, we therefore model it as a gallery
 * list operation.
 */
export type ImageGalleryOperation = 'delete' | 'update' | 'fetch';

/**
 * These are the possible operations that can be made on the overall set of
 * galleries managed by the reducer.  Galleries can be added or deleted or
 * fetched.  There is no update because an update is always made to a gallery
 * specifically.
 */
export type ImageGalleryListOperation = 'add' | 'delete' | 'fetch';

/** State of one particular image gallery. */
export type ImageGalleryState = {
  +processing: ?ImageGalleryOperation,
  +error: ?Object,
  +gallery: ImageGallery,
};

/** State of all of the galleries associated to user. */
export type ImageGalleryListState = {
  +processing: ?ImageGalleryListOperation,
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
  galleries: (new Map(): Map<string, ImageGalleryState>),
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
      return { ...state, processing: 'add', error: null, galleries: Map() };
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

/** Selector returning all galleries in reducer */
export const selectGalleries = (state: ImageGalleryListState) : Array<ImageGallery> => (
  state.galleries.map(g => g.gallery).toIndexedSeq().toArray()
);

/** Selector returning gallery with given id */
export function selectGalleryWithId(state: ImageGalleryListState, galleryId: number)
  : ?ImageGallery {
  const gallery = state.galleries.get(galleryIndex(galleryId));
  return gallery ? gallery.gallery : null;
}

export function selectGalleryWithName(state: ImageGalleryListState, galleryName: ?string)
  : ?ImageGallery {
  if (!galleryName) return null;
  const gallery = state.galleries.find(g => g.gallery.name === galleryName);
  return gallery ? gallery.gallery : null;
}

/**
 * Selector returning the operation presently being processed on the gallery.
 * If the state is stable, this value is null.
 */
export function selectGalleryProcessingType(state: ImageGalleryListState, galleryId: number)
  : ?ImageGalleryOperation {
  const gallery = state.galleries.get(galleryIndex(galleryId));
  return gallery ? gallery.processing : null;
}

/**
 * Selector returning the operation being processed on the list of galleries.
 * Here to, if the state is stable (i.e. no operation being performed), null
 * will be returned.
 */
export function selectGalleryListProcessingType(state: ImageGalleryListState) {
  return state.processing;
}
