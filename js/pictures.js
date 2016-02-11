'use strict';

(function() {
  var pictures = [];
  var filteredPictures = [];
  var activeFilter = 'filter-popular';
  var currentPage = 0;
  var PAGE_SIZE = 12;

  var filters = document.querySelector('.filters');
  filters.classList.remove('hidden');
  filters.addEventListener('click', function(event) {
    var checkedElementID = event.target;
    if (checkedElementID.classList.contains('filters-radio')) {
      setActiveFilter(checkedElementID.id);
    }
  });

  var container = document.querySelector('.pictures');
  var template = document.querySelector('#picture-template');

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
      container.innerHTML = '';
    }
    var fragment = document.createDocumentFragment();

    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = picturesToRender.slice(from, to);

    pagePictures.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      fragment.appendChild(element);
    });

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

      renderPictures(loadedPictures, 0);
      setActiveFilter(activeFilter);
    };

    xhr.send();
  }

  function getElementFromTemplate(data) {
    var element;
    if ('content' in template) {
      element = template.content.childNodes[0].cloneNode(true);
    } else {
      element = template.children[0].cloneNode(true);
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
