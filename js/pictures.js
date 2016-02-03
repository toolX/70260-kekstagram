'use strict';

(function() {
  var filters = document.querySelector('.filters');
  filters.classList.remove('hidden');

  var container = document.querySelector('.pictures');
  var template = document.querySelector('#picture-template');

  getPictures();

  function renderPictures(pictures) {
    pictures.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      container.appendChild(element);
    });
  }

  function getPictures() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.onload = function(event) {
      var rawData = event.target.response;
      var loadedPictures = JSON.parse(rawData);

      renderPictures(loadedPictures);
    };

    xhr.send();
  }

  function getElementFromTemplate(data) {
    if ('content' in template) {
      var element = template.content.childNodes[0].cloneNode(true);
    } else {
      var element = template.children[0].cloneNode(true);
    }
    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    var backgroundImage = new Image();

    var imageLoadTimeout;
    backgroundImage.onload = function() {
      element.style.backgroundImage = 'url(\'' + backgroundImage.src + '\')';
      clearTimeout(imageLoadTimeout);
      var img = element.querySelector('img');
      element.replaceChild(backgroundImage, img);
      backgroundImage.width = 182;
      backgroundImage.height = 182;
    };
    backgroundImage.onerror = function() {
      element.classList.add('picture-load-failure');
    };

    var IMAGE_TIMEOUT = 5000;

    imageLoadTimeout = setTimeout(function() {
      backgroundImage.src = '';
      element.classList.add('picture-load-failure');
    }, IMAGE_TIMEOUT);

    backgroundImage.src = data.url;
    return element;
  }

})();
