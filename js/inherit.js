'use strict';

function inherit(functionChild, functionParent) {
  var EmptyCtor = function() {};
  EmptyCtor.prototype = functionParent.prototype;
  functionChild.prototype = new EmptyCtor();
}

function Child() {}

function Parent() {}

inherit(Child, Parent);
