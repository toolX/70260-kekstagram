'use strict';

(function() {
  /**
   * @param {Object} data
   * @constructor
   */
  function Photo(data) {
    this._data = data;
    this._onClick = this._onClick.bind(this);
  }

  Photo.prototype.render = function() {
    var template = document.querySelector('#picture-template');

    if ('content' in template) {
      this.element = template.content.childNodes[0].cloneNode(true);
    } else {
      this.element = template.children[0].cloneNode(true);
    }
    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

    var backgroundImage = new Image();

    var imageLoadTimeout;
    backgroundImage.onload = function() {
      this.element.style.backgroundImage = 'url(\'' + backgroundImage.src + '\')';
      clearTimeout(imageLoadTimeout);
      var img = this.element.querySelector('img');
      this.element.replaceChild(backgroundImage, img);
      backgroundImage.width = 182;
      backgroundImage.height = 182;
    }.bind(this);
    backgroundImage.onerror = function() {
      this.element.classList.add('picture-load-failure');
    }.bind(this);

    var IMAGE_TIMEOUT = 5000;

    imageLoadTimeout = setTimeout(function() {
      backgroundImage.src = '';
      this.element.classList.add('picture-load-failure');
    }.bind(this), IMAGE_TIMEOUT);

    backgroundImage.src = this._data.url;

    this.element.addEventListener('click', this._onClick);
  };

  Photo.prototype.remove = function() {
    this.element.removeEventListener('click', this._onClick);
  };


  Photo.prototype._onClick = function(event) {
    event.preventDefault();
    if (!event.target.classList.contains('picture-load-failure')) {
      if (typeof this.onClick === 'function') {
        this.onClick();
      }
    }
  };

  window.Photo = Photo;
})();
