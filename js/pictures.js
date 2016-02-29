/* global Photo: true, Gallery: true */

'use strict';

(function() {
  var pictures = [];
  var filteredPictures = [];
  var renderedElements = [];
  var activeFilter = 'filter-popular';
  var currentPage = 0;
  var PAGE_SIZE = 12;
  var gallery = new Gallery();

  var filters = document.querySelector('.filters');
  filters.classList.remove('hidden');
  filters.addEventListener('click', function(event) {
    var checkedElementID = event.target;
    if (checkedElementID.classList.contains('filters-radio')) {
      setActiveFilter(checkedElementID.id);
    }
  });

  var container = document.querySelector('.pictures');

  var scrollTimeout;

  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      var divPicturesCoordinates = container.getBoundingClientRect();
      var viewportSize = window.innerHeight;
      if (divPicturesCoordinates.bottom - viewportSize <= 0) {
        if (currentPage < Math.ceil(filteredPictures.length / PAGE_SIZE)) {
          renderPictures(filteredPictures, ++currentPage);
        }
      }
    }, 100);
  });

  getPictures();

  function renderPictures(picturesToRender, pageNumber, replace) {
    if (replace) {
      gallery._photoArray.length = [];

      var el;
      while ((el = renderedElements.shift())) {
        container.removeChild(el.element);
        el.onClick = null;
        el.remove();
      }
    }
    var fragment = document.createDocumentFragment();

    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = picturesToRender.slice(from, to);

    renderedElements = renderedElements.concat(pagePictures.map(function(photo) {
      var photoElement = new Photo(photo);
      photoElement.render();
      fragment.appendChild(photoElement.element);

      photoElement.onClick = function() {
        gallery.data = photoElement._data;
        gallery.setCurrentPicture(renderedElements.indexOf(photoElement));
        gallery.show();
      };

      return photoElement;
    }));
    gallery.setPictures(filteredPictures);

    container.appendChild(fragment);
  }

  function setActiveFilter(id) {
    filteredPictures = pictures.slice(0);

    switch (id) {
      case 'filter-popular':
        filteredPictures = pictures;
        break;
      case 'filter-new':
        filteredPictures = filteredPictures.sort(function(a, b) {
          if (a.date < b.date) {
            return 1;
          }
          if (a.date > b.date) {
            return -1;
          }
          return 0;
        });
        break;
      case 'filter-discussed':
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }
    renderPictures(filteredPictures, 0, true);
    currentPage = 0;
  }

  function getPictures() {
    container.classList.add('pictures-loading');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://o0.github.io/assets/json/pictures.json');
    xhr.onerror = xhr.ontimeout = function() {
      container.classList.add('pictures-failure');
    };
    xhr.onload = function(event) {
      container.classList.remove('pictures-loading');
      var rawData = event.target.response;
      var loadedPictures = JSON.parse(rawData);
      pictures = loadedPictures;
      gallery.setPictures(pictures);

      renderPictures(gallery._photoArray, 0);
      setActiveFilter(activeFilter);
    };

    xhr.send();
  }
})();
