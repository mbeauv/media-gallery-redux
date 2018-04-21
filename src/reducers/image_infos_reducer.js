// @flow

import { Map } from 'immutable';
import _ from 'lodash';
import type { ImageGalleryImageInfo } from '../models/ImageGalleryImageInfo';
import type { MediaGalleryAction } from '../actions/types';

/**  Operations allowed on an image info object. */
export type ImageInfoOperation = 'delete' | 'update' | 'fetch';

/** Information about one particular image. */
type ImageInfoState = {
  +processing: ?ImageInfoOperation,
  +imageInfo: ImageGalleryImageInfo,
  +error: ?Object,
};

/** Information about one gallery of images. */
type GalleryImagesState = {
  +loading: boolean,
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
    r.push([imageIndex(v.id), { loading: false, error: null, imageInfo: v }]);
    return r;
  }, infos);

  const gallery = { loading: false, error: null, imageInfos: Map(infos) };
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
        loading: false,
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
        loading: true,
        error: null,
        imageInfos: Map(),
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_LIST_RESPONSE_ERROR':
      return mergeGallery(state, action.galleryId, {
        loading: false,
        error: action.error,
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_LIST_RESPONSE_OK':
      return processGalleryListResponseOk(state, action.galleryId, action.imageInfos);
    case 'IMAGE_GALLERY_IMAGE_INFO_CREATE_REQUEST':
      return mergeGallery(state, action.galleryId, {
        loading: true,
        error: null,
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_CREATE_RESPONSE_ERROR':
      return mergeGallery(state, action.galleryId, {
        loading: false,
        error: action.error,
      });
    case 'IMAGE_GALLERY_IMAGE_INFO_CREATE_RESPONSE_OK':
      return mergeGalleryImages(state, action.galleryId, action.imageInfo.id, {
        loading: false,
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

export function selectImageInfos(
  state: State,
  galleryId: number,
) : Array<ImageGalleryImageInfo> {
  const gallery = state.galleryImages.get(galleryImageIndex(galleryId));
  return gallery ? gallery.imageInfos.map(i => i.imageInfo).toIndexedSeq().toArray() : [];
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

export function selectImageInfo(
  state: State,
  galleryId: number,
  imageInfoId: number,
) : ?ImageGalleryImageInfo {
  const info = getGalleryImageInfo(state, galleryId, imageInfoId);
  return info ? info.imageInfo : null;
}
