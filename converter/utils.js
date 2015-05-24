import _ from 'lodash';

/**
 * Visit.
 *
 * @param {Node} tree
 * @param {function(node)} callback
 */
export function visit(tree, callback) {
  /**
   * Visit a single node.
   */
  function one(node) {
    callback(node);

    var children = node.children;
    var index = -1;
    var length = children ? children.length : 0;

    while (++index < length) {
      one(children[index]);
    }
  }

  one(tree);
}

/**
 * EXTREMELY rudimentary JS detection.
 * @param  {String}  str String to autodetect
 * @return {Boolean}     Whether or not str is JS
 */
export function isJS(str) {
  if (
    _.contains(str, 'function(') ||
    _.contains(str, 'var')) {
    return true;
  }
  return false;
}
