// @flow

import { Map } from 'immutable';
import _ from 'lodash';
import type { ImageGalleryImageInfo } from '../models/ImageGalleryImageInfo';
import type { MediaGalleryAction } from '../actions/types';

/**  Operations allowed on an image info object. */
export type ImageInfoOperation = 'delete' | 'update' | 'fetch';

/**  Operations allowed on an image info collection. */
export type ImageInfosOperation = 'add' | 'delete' | 'fetch';

/** Information about one particular image. */
type ImageInfoState = {
  +processing: ?ImageInfoOperation,
  +imageInfo: ImageGalleryImageInfo,
  +error: ?Object,
};

/** Information about one gallery of images. */
type GalleryImagesState = {
  +processing: ?ImageInfosOperation,
  +error: ?Object,
  +imageInfos: Map<string, ImageInfoState>,
}

/** Information about all of the gallery images. */
type State = {
  +galleryImages: Map<string, GalleryImagesState>,
};

/** Constructs the index name for a gallery image collection. */
const galleryImageIndex = (galleryId: number) : string => `gallery_${galleryId}`;

const imageIndex = (imageId: number) => `image_${imageId}`;

function getGalleryImageInfo(
  state: State,
  galleryId: number,
  imageInfoId: number,
) : ?ImageInfoState {
  const gallery = state.galleryImages.get(galleryImageIndex(galleryId));
  return gallery ? gallery.imageInfos.get(imageIndex(imageInfoId)) : null;
}

const INITIAL_STATE = { galleryImages: new Map() };

function processGalleryListResponseOk(
  state: State,
  galleryId: number,
  imageInfos: Array<ImageGalleryImageInfo>,
) : State {
  const infos = [];
  _.reduce(imageInfos, (r, v) => {
    r.push([imageIndex(v.id), { processing: null, error: null, imageInfo: v }]);
    return r;
  }, infos);

  const gallery = { processing: null, error: null, imageInfos: Map(infos) };
  return {
    ...state,
    galleryImages: state.galleryImages.set(galleryImageIndex(galleryId), gallery),
  };
}

function processDeleteOk(
  state: State,
  galleryId: number,
  imageInfoId: number,
) : State {
  const galleryIndex = galleryImageIndex(galleryId);
  const galleryImageState = state.galleryImages.get(galleryIndex);

  if (galleryImageState) {
    const imageInfos = galleryImageState.imageInfos.delete(imageIndex(imageInfoId));
    const newGalleryImageState = { ...galleryImageState, imageInfos };
    return {
      ...state,
      galleryImages: state.galleryImages.set(galleryIndex, newGalleryImageState),
    };
  }

  return state;
}

function mergeGallery(state: State, galleryId: number, attribs: Object) : State {
  return {
    ...state,
    galleryImages: state.galleryImages.mergeDeep({
      [galleryImageIndex(galleryId)]: attribs,
    }),
  };
}

function mergeGalleryImages(
  state: State,
  galleryId: number,
  imageInfoId: number,
  attribs: Object,
) : State {
  return {
    ...state,
    galleryImages: state.galleryImages.mergeDeep({
      [galleryImageIndex(galleryId)]: {
        processing: null,
        error: null,
        imageInfos: {
          [imageIndex(imageInfoId)]: attribs,
        },
      },
    }),
  };
}

export function imageInfosReducer(
  state : State = INITIAL_STATE,
  action : MediaGalleryAction,
) : State {
  switch (action.type) {
    case 'IMAGE_GALLERY_IMAGE_INFO_LIST_REQUEST':
      return mergeGallery(state, action.galleryId, {
        processing: 'fetch',
        error: null,
        imageInfos: Map(),
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_LIST_RESPONSE_ERROR':
      return mergeGallery(state, action.galleryId, {
        processing: null,
        error: action.error,
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_LIST_RESPONSE_OK':
      return processGalleryListResponseOk(state, action.galleryId, action.imageInfos);
    case 'IMAGE_GALLERY_IMAGE_INFO_CREATE_REQUEST':
      return mergeGallery(state, action.galleryId, {
        processing: 'add',
        error: null,
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_CREATE_RESPONSE_ERROR':
      return mergeGallery(state, action.galleryId, {
        processing: null,
        error: action.error,
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_CREATE_RESPONSE_OK':
      return mergeGalleryImages(state, action.galleryId, action.imageInfo.id, {
        processing: null,
        error: null,
        imageInfo: action.imageInfo,
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_DELETE_REQUEST':
      return mergeGalleryImages(state, action.galleryId, action.imageInfoId, {
        processing: 'delete',
        error: null,
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_DELETE_RESPONSE_ERROR':
      return mergeGalleryImages(state, action.galleryId, action.imageInfoId, {
        processing: null,
        error: action.error,
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_DELETE_RESPONSE_OK':
      return processDeleteOk(state, action.galleryId, action.imageInfoId);
    case 'IMAGE_GALLERY_IMAGE_INFO_UPDATE_REQUEST':
      return mergeGalleryImages(state, action.galleryId, action.imageInfoId, {
        processing: 'update',
        error: null,
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_UPDATE_RESPONSE_ERROR':
      return mergeGalleryImages(state, action.galleryId, action.imageInfoId, {
        processing: null,
        error: action.error,
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_UPDATE_RESPONSE_OK':
      return mergeGalleryImages(state, action.galleryId, action.imageInfo.id, {
        processing: null,
        error: null,
        imageInfo: action.imageInfo,
      });
    default:
      return state;
  }
}

/** Return all the image infos associated to a given gallery. */
export function selectImageInfos(
  state: State,
  galleryId: number,
) : Array<ImageGalleryImageInfo> {
  const gallery = state.galleryImages.get(galleryImageIndex(galleryId));
  return gallery ? gallery.imageInfos.map(i => i.imageInfo).toIndexedSeq().toArray() : [];
}

/** Return the processing state of the gallery collection. */
export function selectImageInfosProcessingType(
  state: State,
  galleryId: number,
) : ?ImageInfosOperation {
  const gallery = state.galleryImages.get(galleryImageIndex(galleryId));
  return gallery ? gallery.processing : null;
}

/** Return the error object of the gallery collection. */
export function selectImageInfosError(
  state: State,
  galleryId: number,
) : ?Object {
  const gallery = state.galleryImages.get(galleryImageIndex(galleryId));
  return gallery ? gallery.error : null;
}

/** Returns operation being processed on given image info. */
export function selectImageInfoProcessingType(
  state: State,
  galleryId: number,
  imageInfoId: number,
) : ?ImageInfoOperation {
  const gallery = state.galleryImages.get(galleryImageIndex(galleryId));
  if (gallery) {
    const imageInfo = gallery.imageInfos.get(imageIndex(imageInfoId));
    if (imageInfo) {
      return imageInfo.processing;
    }
  }
  return null;
}

/** Returns error on given image info. */
export function selectImageInfoError(
  state: State,
  galleryId: number,
  imageInfoId: number,
) : ?Object {
  const gallery = state.galleryImages.get(galleryImageIndex(galleryId));
  if (gallery) {
    const imageInfo = gallery.imageInfos.get(imageIndex(imageInfoId));
    if (imageInfo) {
      return imageInfo.error;
    }
  }
  return null;
}

export function selectImageInfo(
  state: State,
  galleryId: number,
  imageInfoId: number,
) : ?ImageGalleryImageInfo {
  const info = getGalleryImageInfo(state, galleryId, imageInfoId);
  return info ? info.imageInfo : null;
}
