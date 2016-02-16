'use strict';

(function() {
  /**
   * @constructor
   */
  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeButton = this.element.querySelector('.gallery-overlay-close');

    this._onCloseClick = this._onCloseClick.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  };

  /**
   * Gallery show
   */
  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');

    this._closeButton.addEventListener('click', this._onCloseClick);
    document.addEventListener('keydown', this._onDocumentKeyDown);
  };

  /**
   * Gallery hide
   */
  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this._closeButton.removeEventListener('click', this._onCloseClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
  };

  Gallery.prototype._onPhotoClick = function() {

  };

  Gallery.prototype._onDocumentKeyDown = function(event) {
    event.preventDefault();
    if (event.keyCode === 27) {
      this.hide();
    }
  };

  Gallery.prototype._onCloseClick = function() {
    this.hide();
  };

  window.Gallery = Gallery;
})();
