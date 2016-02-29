'use strict';

(function() {
  /**
   * @constructor
   */
  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeButton = this.element.querySelector('.gallery-overlay-close');
    this._galleryOverlayImage = this.element.querySelector('.gallery-overlay-image');
    this._likesCount = this.element.querySelector('.likes-count');
    this._commentsCount = this.element.querySelector('.comments-count');

    this._onCloseClick = this._onCloseClick.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    this._photoArray = [];
    this._index = null;
  };

  /**
   *Gallery get pictures
  */
  Gallery.prototype.setPictures = function(pictures) {
    this._photoArray.length = 0;
    for (var i = 0; i < pictures.length; i++) {
      this._photoArray = this._photoArray.concat(pictures[i]);
    }
  };

  /**
   *Show picture, likes and comments in gallery
   */
  Gallery.prototype.setCurrentPicture = function(number) {
    this._galleryOverlayImage.src = this._photoArray[number].url;
    this._likesCount.innerHTML = +this._photoArray[number].likes;
    this._commentsCount.innerHTML = +this._photoArray[number].comments;

    this._index = number;
  };

  /**
   * Gallery show
   */
  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');

    this._galleryOverlayImage.addEventListener('click', this._onPhotoClick);
    this._closeButton.addEventListener('click', this._onCloseClick);
    document.addEventListener('keydown', this._onDocumentKeyDown);
  };

  /**
   * Gallery hide
   */
  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this._galleryOverlayImage.removeEventListener('click', this._onPhotoClick);
    this._closeButton.removeEventListener('click', this._onCloseClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
  };

  Gallery.prototype.nextPhoto = function(index) {
    if (!this._photoArray[index + 1]) {
      return;
    }
    var a = 'failed';
    var b = 'mp4';
    if (this._photoArray[index + 1].url.contains(a) || this._photoArray[index + 1].url.contains(b)) {
      this.nextPhoto(index + 1);
      return;
    }
    this.setCurrentPicture(index + 1);
  };

  Gallery.prototype.prevPhoto = function(index) {
    if (!this._photoArray[index - 1]) {
      return;
    }
    var a = 'failed';
    var b = 'mp4';
    if (this._photoArray[index - 1].url.contains(a) || this._photoArray[index - 1].url.contains(b)) {
      this.prevPhoto(index - 1);
      return;
    }
    this.setCurrentPicture(index - 1);
  };

  Gallery.prototype._onPhotoClick = function(event) {
    event.preventDefault();
    this.nextPhoto(this._index);
  };

  Gallery.prototype._onDocumentKeyDown = function(event) {
    event.preventDefault();
    if (event.keyCode === 39) {
      this.nextPhoto(this._index);
    }
    if (event.keyCode === 37) {
      this.prevPhoto(this._index);
    }
    if (event.keyCode === 27) {
      this.hide();
    }
  };

  Gallery.prototype._onCloseClick = function() {
    this.hide();
  };

  window.Gallery = Gallery;
})();
