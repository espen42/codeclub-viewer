// Structure of replaceTags:
// {
//   <oldtag>: {
//     tag: <newtag>
//     attrs: {
//       <attribute>: <value>,
//       ...
//     }
// }
const replaceTags = {
  toggle: {
    tag: 'div',
    attrs: {
      class: 'togglebutton'
    }
  }
};

const processContent = (content, styles) => {
  const parser = require('posthtml-parser');
  const render = require('posthtml-render');

  let parsedContent = parser(content);
  parsedContent = replaceClassRecursively(parsedContent, styles);
  content = render(parsedContent);
  if (typeof document !== 'undefined') {
    content = renderScratchBlocks(content, styles);
  }
  return content;
};

const replaceTagObject = (obj) => {
  const tag = obj['tag'];
  if (tag in replaceTags) {
    const replacementObj = replaceTags[tag];
    return {
      ...obj,
      tag: replacementObj['tag'],
      attrs: {...obj['attrs'], ...replacementObj['attrs']}
    };
  } else {
    return obj;
  }
};

const insertHeaderIcons = (obj) => {
  const icons = {
    'check': require('assets/graphics/check.svg'),
    'flag': require('assets/graphics/flag.svg'),
    'save': require('assets/graphics/save.svg'),
  };
  if (obj.tag === 'h2') {
    const className = (obj.attrs || {}).class;
    if (Object.keys(icons).includes(className)) {
      return {
        ...obj,
        content: [
          {
            tag: 'img',
            attrs: { src: icons[className] }
          },
          ...obj.content
        ]
      };
    }
  }
  return obj;
};

const replaceClass = (obj, styles) => {
  let newObj = {};
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) {
      if (k === 'class' && obj[k] in styles) {
        newObj[k] = styles[obj[k]];
      } else {
        newObj[k] = replaceClassRecursively(obj[k], styles);
      }
    }
  }
  return newObj;
};

const replaceClassRecursively = (obj, styles) => {
  if (Array.isArray(obj)) {
    return obj.map((val, idx) => replaceClassRecursively(val, styles));
  } else if (typeof obj === 'object' && obj !== null) {
    let repObj = obj;
    repObj = replaceTagObject(repObj);
    repObj = insertHeaderIcons(repObj);
    repObj = replaceClass(repObj, styles);
    return repObj;
  } else {
    return obj;
  }
};


/**
 * Render scratchblocks.
 *
 * @param content {string} HTML with <pre class="blocks">...</pre>
 * @param styles {object} css-modules object
 * @returns {string} <pre class="blocks">...</pre> replaced with SVG
 */
const renderScratchBlocks = (content, styles) => {
  const scratchblocks = require('scratchblocks/browser/scratchblocks.js');

  let replace = [];
  if ('blocks' in styles) {
    replace.push({start: '<pre class="' + styles.blocks + '">', end: '</pre>'});
  }
  if ('b' in styles) {
    replace.push({start: '<code class="' + styles.b + '">', end: '</code>', options: {inline: true}});
  }

  let returnContent = content;
  replace.forEach(r => {
    const re = new RegExp(r.start + '[\\s\\S]*?' + r.end, 'g');

    let blocks = content.match(re);
    if (blocks) {
      blocks.forEach(block => {
        let code = block.substring(r.start.length, block.length - r.end.length);
        let SVG = scratchblocks(code, r.options);
        returnContent = returnContent.replace(block, SVG);
      });
    }
  });

  return returnContent;
};

export default processContent;
