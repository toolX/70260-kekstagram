/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var resizeX = +resizeForm.x.value;
    var resizeY = +resizeForm.y.value;
    var size = +resizeForm.size.value;
    if ((resizeX + size) > currentResizer._image.naturalWidth) {
      return false;
    } else if ((resizeY + size) > currentResizer._image.naturalHeight) {
      return false;
    } else if (resizeX < 0) {
      return false;
    } else if (resizeY < 0) {
      return false;
    }
    return true;
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  function uploadFormOnchange(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
          currentResizer._image.addEventListener('load', resizerLoad);
          function resizerLoad() {
            //var inputX = document.getElementById('resize-x');
            //var inputY = document.getElementById('resize-y');
            //var inputSize = document.getElementById('resize-size');
            currentResizer.getConstraint();
            var x = currentResizer._resizeConstraint.x;
            var y = currentResizer._resizeConstraint.y;
            var side = currentResizer._resizeConstraint.side;
            currentResizer.setConstraint(x, y, side);
          }

        };
        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  }
  uploadForm.addEventListener('change', uploadFormOnchange);
  function resizerChange() {
    var inputX = document.getElementById('resize-x');
    var inputY = document.getElementById('resize-y');
    var inputSize = document.getElementById('resize-size');
    currentResizer.getConstraint();
    var x = currentResizer._resizeConstraint.x;
    var y = currentResizer._resizeConstraint.y;
    var side = currentResizer._resizeConstraint.side;
    inputX.value = x;
    inputY.value = y;
    inputSize.value = side;
  }
  window.addEventListener('resizerchange', resizerChange);

  var inputSize = document.getElementById('resize-size');
  inputSize.addEventListener('input', resizerSideChange);
  function resizerSideChange() {
    currentResizer.moveConstraint(0, 0, 1);
  }
  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  function resizeFormOnreset(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  }
  resizeForm.addEventListener('reset', resizeFormOnreset);

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  function resizeFormOnsubmit(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    } else {
      resizeForm.fwd.classList.add('disabled');
    }
  }
  resizeForm.addEventListener('submit', resizeFormOnsubmit);

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  function filterFormOnreset(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  }
  filterForm.addEventListener('reset', filterFormOnreset);

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  function filterFormOnsubmit(evt) {
    evt.preventDefault();

    var elems = filterForm['upload-filter'];
    for (var i = 0; i < elems.length; i++) {
      if (elems[i].checked) {
        var date = new Date();
        var year = date.getFullYear() - 1;
        var myBirthday = new Date(year + '-05-15');
        var firstDateFormatted = Math.floor((Date.now() - myBirthday) / 24 / 60 / 60 / 1000);
        var dateToExpire = Date.now() + firstDateFormatted * 24 * 60 * 60 * 1000;
        var formattedDateToExpire = new Date(dateToExpire).toUTCString();
        document.cookie = 'lastFilter=' + elems[i].value + ';expires=' + formattedDateToExpire;
      }
    }

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  }
  filterForm.addEventListener('submit', filterFormOnsubmit);

  /* global docCookies: true */
  var elems = filterForm['upload-filter'];
  for (var i = 0; i < elems.length; i++) {
    if (elems[i].value === docCookies.getItem('lastFilter')) {
      elems[i].checked = true;
      filterImage.className = 'filter-image-preview ' + 'filter-' + docCookies.getItem('lastFilter');
    }
  }
  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  function filterFormOnchange() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  }
  filterForm.addEventListener('change', filterFormOnchange);

  cleanupResizer();
  updateBackground();
})();
