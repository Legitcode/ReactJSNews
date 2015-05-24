import {visit, isJS} from './utils';


function transformer(ast, file) {
  visit(ast, function (node) {
    if (node.type === 'code') {
      if (node.lang === null && isJS(node.value)) {
        node.lang = 'js';
      } else if (node.lang === 'txt') {
        node.lang = null;
      }
    }
  });
}

export default function(mdast, options) {
  return transformer;
}
