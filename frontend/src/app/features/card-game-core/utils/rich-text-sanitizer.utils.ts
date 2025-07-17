// https://www.npmjs.com/package/html2bbcode
// https://github.com/JiLiZART/bbob
// https://codepen.io/JiLiZART/full/vzMvpd
// https://github.com/donnikitos/AngularJS-BBcode
// https://github.com/thoughtsunificator/bbcode-parser
// https://bbcode-parser-template.unificator.me/module-template-Template.html
// https://github.com/thoughtsunificator/bbcode-parser-template-demo

// https://stackoverflow.com/questions/69269283/how-to-get-document-object-in-angular-component

// https://github.com/genert/bbcode
// https://github.com/genert/bbcode/blob/master/src/Parser/BBCodeParser.php
export interface parser {
  pattern: RegExp;
  replace: string;
  content?: string;
}

// FIXME: The YouTube embedding width and height and is gonna differ depending on the Angular Editor
// TODO: Font size - https://www.bbcode.org/changing-the-font-size-with-bbcode.php


// https://medium.com/@onlinemsr/javascript-string-format-the-best-3-ways-to-do-it-c6a12b4b94ed

export const RICH_TEXT_SANITIZER_DEFAULT_BBCODE_PATTERN: string = `\\[element\\]content\\[\\/element\\]`;

export const RICH_TEXT_SANITIZER_STYLABLE_BBCODE_PATTERN: string = `\\[elementstyle\\]content\\[\\/element\\]`;
export const RICH_TEXT_SANITIZER_STYLABLE_HTML_PATTERN: string = `\\<elementstyle\\>content\\<\\/element\\>`;

export const RICH_TEXT_SANITIZER_ATTRIBUTE_HTML_PATTERN: string = `attribute\\s*=\\s*"value"`;

export const NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN: string = '(.*?)';
export const DIGIT_REGEX_PATTERN: string = '(\\d+)';

export const BORDER_STYLE_REGEX_PATTERN: string = '\\s*((dotted|dashed|solid|double|groove|ridge|inset|outset|none|hidden)(\\s+(dotted|dashed|solid|double|groove|ridge|inset|outset|none|hidden)){0,3})\\s*';

export const POSITION_REGEX_PATTERN: string = '\\s*(-?\\d+(?:\\.\\d+)?(?:px|em|rem|%)|auto|inherit|initial|unset|revert|revert-layer)(?:\\s+(-?\\d+(?:\\.\\d+)?(?:px|em|rem|%)|auto|inherit|initial|unset|revert|revert-layer))wd\\s';

/*
-?\d+(\.\d+)?(px|em|rem|%)        # a single value
(?:\s+-?\d+(\.\d+)?(px|em|rem|%)){0,3}   # up to three more, each preceded by space

Original regex treated whitespace as a possible value, not as a separator, which results in counting spaces between -0px tokens as separate “values” and miscounts overall numbers. 
*/

export const DIMENSION_REGEX_PATTERN: string = '(-?\\d+)(px|em|rem|%)|auto|inherit|initial';

// TODO: Make a color name too?
export const HEX_REGEX_PATTERN: string = '#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})';
export const RGBA_REGEX_PATTERN: string = 'rgba?\\(\\s*(?:\\d+%?|\\d*\\.\\d+%?)\\s*,\\s*(?:\\d+%?|\\d*\\.\\d+%?)\\s*,\\s*(?:\\d+%?|\\d*\\.\\d+%?)(?:\\s*,\\s*(?:\\d+|\\d*\\.\\d+))?\\s*\\)';
export const HSLA_REGEX_PATTERN: string = 'hsla?\\(\\s*(?:\\d+|\\d*\\.\\d+)\\s*,\\s*(?:\\d+%|\\d*\\.\\d+%)\\s*,\\s*(?:\\d+%|\\d*\\.\\d+%)(?:\\s*,\\s*(?:\\d+|\\d*\\.\\d+))?\\s*\\)';

// https://stackoverflow.com/a/9655186
// NOTE: Make sure when passing in for it, set the flag to i, it should already be case insensitive by default
// Instead have the words range from 7 - 21 letters, make it easier?
export const CSS_COLOR_NAMES_REGEX_PATTERN: string = '(AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGray|DarkGrey|DarkGreen)';


export const CSS_COLOR_VALUE_REGEX_PATTERN: string = `(\\${HEX_REGEX_PATTERN}|${RGBA_REGEX_PATTERN}|${HSLA_REGEX_PATTERN})`;

export const format = (template: string, replacements: Map<RegExp | string, string>): string => {
  replacements.forEach((value: string, key: string | RegExp) => {
    template = template.replace(key, value);
  });

  console.log(`Formatted replaced placeholder: ${template}`);

  return template;
}

export function getPattern(regExp: RegExp | string, flags: string = 'gis'): RegExp {
  return new RegExp(regExp, flags);
}

export function getReplacement(template: string, replacements: Map<RegExp | string, string>): string {
  return format(template, replacements);
}

export function getDefaultBBCodePattern(element: string, content: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = RICH_TEXT_SANITIZER_DEFAULT_BBCODE_PATTERN): RegExp {
  return getPattern(format(template, new Map([
    [/element/g, element],
    [/content/g, content]
  ])));
}

export function getStylablePattern(element: string, markup: number = 0, style: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, content: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = ``): RegExp {
  let replacements: Map<RegExp | string, string> = new Map([
    [/element/g, element],
    [/style/g, style],
    [/content/g, content]
  ]);

  if (template != "") {
    return getPattern(format(template, replacements));
  }

  switch (markup) {
    case 1:
       return getPattern(format(RICH_TEXT_SANITIZER_STYLABLE_HTML_PATTERN, replacements));
    default:
      return getPattern(format(RICH_TEXT_SANITIZER_STYLABLE_BBCODE_PATTERN, replacements));
  }
}

export function getStylableReplacement(element: string, markup: number = 0, style: string = '$1', content: string ='$2', template: string = ``): string {
  let replacements: Map<RegExp | string, string> = new Map([
    [/\$\{element\}/g, element],
    [/\$\{style\}/g, style],
    [/\$\{content\}/g, content]
  ]);
  
  if (template != "") {
    return getReplacement(template, replacements);
  }

  switch (markup) {
    case 1: // HTML
       return getReplacement(`<${'${element}'}${'${style}'}>${'${content}'}</${'${element}'}>`, replacements);
    default: // BBCode
      return getReplacement(`[${'${element}'}${'${style}'}]${'${content}'}[/${'${element}'}]`, replacements);
  }
}

// TODO: Do we want to keep these, refer to getStylableReplacement
export function getStylableBBCodeReplacement(element: string, style: string, content: string, template: string = `[${'${element}'}${'${style}'}]${'${content}'}[/${'${element}'}]`): string {
  return getReplacement(template, new Map([
    [/\$\{element\}/g, element],
    [/\$\{style\}/g, style],
    [/\$\{content\}/g, content]
  ]));
}

export function getStylableBBCodePattern(element: string, style: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, content: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = RICH_TEXT_SANITIZER_STYLABLE_BBCODE_PATTERN): RegExp {
  return getPattern(format(template, new Map([
    [/element/g, element],
    [/style/g, style],
    [/content/g, content]
  ])));
}

export function getDefaultBBCodeReplacement(element: string, content: string, template: string = `[${'${element}'}]${'${content}'}[/${'${element}'}]`): string {
  return getReplacement(template, new Map([
    [/\$\{element\}/g, element],
    [/\$\{content\}/g, content]
  ]));
}

export function getStylableHTMLPattern(element: string, style: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, content: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = RICH_TEXT_SANITIZER_STYLABLE_HTML_PATTERN): RegExp {
  return getPattern(format(template, new Map([
    [/element/g, element],
    [/style/g, style],
    [/content/g, content]
  ])));
}

export function getCSSHTMLPattern(property: string, content: string): RegExp {
  return new RegExp(`(?:${property}:\\s*${content})(?:;|")`, 'gis');
  // return new RegExp(`(?:^${property}: ${content};?)|(?:.+${property}: ${content};)`, 'gis');
}

export function getAttributeHTMLPattern(attribute: string, value: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = RICH_TEXT_SANITIZER_ATTRIBUTE_HTML_PATTERN): RegExp {
  return getPattern(format(template, new Map([
    [/attribute/g, attribute],
    [/value/g, value]
  ])));
}

export function getCSSHTMLReplacement(property: string, value: string): string {
  return `${property}: ${value};`
}

export function getAttributeHTMLReplacement(attribute: string, value: string): string {
  return `${attribute}="${value}"`;
}

// TODO: Do we want to keep these, refer to getStylableReplacement
export function getStylableHTMLReplacement(element: string, style: string, content: string, template: string = `<${'${element}'}${'${style}'}>${'${content}'}</${'${element}'}>`): string {
  return getReplacement(template, new Map([
    [/\$\{element\}/g, element],
    [/\$\{style\}/g, style],
    [/\$\{content\}/g, content]
  ]));
}


// NOTE: Anything that's a property should go before an element
export const bbCodeParsers: Record<string, parser> = {
  border: {
    pattern: getDefaultBBCodePattern('border'),
    replace: getCSSHTMLReplacement('border', '$1')
  },
  borderwidth: {
    pattern: getDefaultBBCodePattern('border-width'),
    replace: getCSSHTMLReplacement('border-width', '$1')
  },
  borderstyle: {
    pattern: getDefaultBBCodePattern('border-style', BORDER_STYLE_REGEX_PATTERN),
    replace: getCSSHTMLReplacement('border-style', '$1')
  },
  bordercolor: {
    pattern: getDefaultBBCodePattern('border-color', CSS_COLOR_VALUE_REGEX_PATTERN),
    replace: getCSSHTMLReplacement('border-color', '$1')
  },
  attrcolor: {
    pattern: getDefaultBBCodePattern('attrcolor', CSS_COLOR_VALUE_REGEX_PATTERN),
    replace: getAttributeHTMLReplacement('color', "$1")
  },
  size: {
    pattern: getDefaultBBCodePattern('size', DIGIT_REGEX_PATTERN),
    replace: getAttributeHTMLReplacement('size', "$1")
  },
  margin: {
    pattern: getDefaultBBCodePattern('margin', POSITION_REGEX_PATTERN),
    replace: getCSSHTMLReplacement('margin', '$1')
  },
  padding: {
    pattern: getDefaultBBCodePattern('padding', POSITION_REGEX_PATTERN),
    replace: getCSSHTMLReplacement('padding', '$1')
  },
  h1: {
    pattern:getStylablePattern('h1'),
    replace: getStylableReplacement('h1', 1)
  },
  h2: {
    pattern:getStylablePattern('h2'),
    replace: getStylableReplacement('h2', 1)
  },
  h3: {
    pattern:getStylablePattern('h3'),
    replace: getStylableReplacement('h3', 1)
  },
  h4: {
    pattern:getStylablePattern('h4'),
    replace: getStylableReplacement('h4', 1)
  },
  h5: {
    pattern:getStylablePattern('h5'),
    replace: getStylableReplacement('h5', 1)
  },
  h6: {
    pattern:getStylablePattern('h6'),
    replace: getStylableReplacement('h6', 1)
  },
  bold: {
    pattern:getStylablePattern('b'),
    replace: getStylableReplacement('b', 1)
  },
  strong: {
    pattern:getStylablePattern('strong'),
    replace: getStylableReplacement('strong', 1)
  },
  italic: {
    pattern:getStylablePattern('i'),
    replace: getStylableReplacement('i', 1)
  },
  em: {
    pattern:getStylablePattern('em'),
    replace: getStylableReplacement('em', 1)
  },
  underline: {
    pattern:getStylablePattern('u'),
    replace: getStylableReplacement('u', 1)
  },
  del: {
    pattern:getStylablePattern('del'),
    replace: getStylableReplacement('del', 1)
  },
  strikethrough: {
    pattern:getStylablePattern('s'),
    replace: getStylableReplacement('strike', 1)
  },
  quote: {
    pattern:getStylablePattern('quote'),
    replace: getStylableReplacement('blockquote',1)
  },
  link: {
    pattern: /\[url\](.*?)\[\/url\]/s,
    replace: '<a href=\'$1\'>$1</a>',
  },
  namedlink: {
    pattern: /\[url=(.*?)\](.*?)\[\/url\]/s,
    replace: '<a href=\'$1\'>$2</a>',
    content: '$2'
  },
  image: {
    pattern: /\[img\](.*?)\[\/img\]/s,
    /*
    pattern: getPattern(/\[imgstyle\]content\[\/img\]/)
    */
    replace: '<img src=\'$1\'>',
  },
  orderedlistnumerical: {
    pattern: /\[list=1\](.*?)\[\/list\]/s,
    replace: '<ol>$1</ol>',
  },
  orderedlistalpha: {
    pattern: /\[list=a\](.*?)\[\/list\]/s,
    replace: '<ol type=a>$1</ol>',
  },
  unorderedlist: {
    pattern: getStylablePattern('ul'),
    replace: getStylableReplacement('ul', 1)
  },
  listitem: {
    pattern: /\[\*\](.*)/,
    replace: '<li>$1</li>',
  },
  code: {
    pattern: getStylablePattern('code'),
    replace: getStylableReplacement('code',1)
  },
  youtube: {
    pattern: /\[youtube\](.*?)\[\/youtube\]/s,
    replace: '<iframe width=560 height=315 src=//www.youtube-nocookie.com/embed/$1 frameborder=0 allowfullscreen></iframe>',
  },
  sub: {
    pattern: getStylablePattern('sub'),
    replace: getStylableReplacement('sub', 1)
  },
  sup: {
    pattern: getStylablePattern('sup'),
    replace: getStylableReplacement('sup', 1)
  },
  small: {
    pattern: getStylablePattern('small'),
    replace: getStylableReplacement('small', 1)
  },
  /*style: {
    pattern: getStylablePattern('style'),
    replace: getStylableHTMLReplacement('style', '$1', '$2')
  },*/
  p: {
    pattern: getStylablePattern('p'),
    replace: getStylableReplacement('p', 1)
  },
  span: {
    pattern: getStylablePattern('span'),
    replace: getStylableReplacement('span', 1)
  },
  table: {
    pattern: getStylablePattern('table'),
    replace: getStylableReplacement('table', 1)
  },
  tablerow: {
    pattern: getStylablePattern('tr'),
    replace: getStylableReplacement('tr', 1)
  },
  tabledata: {
    pattern: getStylablePattern('td'),
    replace: getStylableReplacement('td',  1)
  }
};

export const htmlParsers: Record<string, parser> = {
  size: {
    pattern: getAttributeHTMLPattern('size', DIGIT_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('size', '$1')
  },
  border: {
    pattern: getCSSHTMLPattern('border', NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('border', '$1')
  },
  borderwidth: {
    pattern: getCSSHTMLPattern('border-width', NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('border-width', '$1')
  },
  borderstyle: {
    pattern: getCSSHTMLPattern('border-style', BORDER_STYLE_REGEX_PATTERN), 
    replace: getDefaultBBCodeReplacement('border-style', '$1')
  },
  bordercolor: {
    pattern: getCSSHTMLPattern('border-color', CSS_COLOR_VALUE_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('border-color', '$1')
  },
  attrcolor: {
    pattern: getAttributeHTMLPattern('color',  CSS_COLOR_VALUE_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('attrcolor', '$1')
  },
  margin: {
    pattern: getCSSHTMLPattern('margin', POSITION_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('margin', '$1')
  },
  padding: {
    pattern: getCSSHTMLPattern('padding', POSITION_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('padding', '$1')
  },
  h1: {
    pattern: getStylablePattern('h1', 1),
    replace: getStylableReplacement('h1')
  },
  h2: {
    pattern: getStylablePattern('h2', 1),
    replace: getStylableReplacement('h2')
  },
  h3: {
    pattern: getStylablePattern('h3', 1),
    replace: getStylableReplacement('h3')
  },
  h4: {
    pattern: getStylablePattern('h4', 1),
    replace: getStylableReplacement('h4')
  },
  h5: {
    pattern: getStylablePattern('h5', 1),
    replace: getStylableReplacement('h5')
  },
  h6: {
    pattern: getStylablePattern('h6', 1),
    replace: getStylableReplacement('h6')
  },
  bold: {
    pattern: getStylablePattern('b', 1),
    replace: getStylableReplacement('b')
  },
  strong: {
    pattern: getStylablePattern('strong', 1),
    replace: getStylableReplacement('strong')
  },
  italic: {
    pattern: getStylablePattern('i', 1),
    replace: getStylableReplacement('i')
  },
  em: {
    pattern: getStylablePattern('em', 1),
    replace: getStylableReplacement('em')
  },
  underline: {
    pattern: getStylablePattern('u', 1),
    replace: getStylableReplacement('u')
  },
  strikethrough: {
    pattern: getStylablePattern('strike', 1),
    replace: getStylableReplacement('s')
  },
  del: {
    pattern: getStylablePattern('del', 1),
    replace: getStylableReplacement('del')
  },
  code: {
    pattern: getStylablePattern('code', 1),
    replace: getStylableReplacement('code')
  },
  orderedlistnumerical: {
    pattern: /<ol>(.*?)<\/ol>/s,
    replace: '[list=1]$1[/list]',
  },
  unorderedlist: {
    pattern: getStylablePattern('ul', 1),
    replace: getStylableReplacement('ul')
  },
  listitem: {
    pattern: /<li>(.*?)<\/li>/s,
    replace: '[*]$1',
  },
  link: {
    pattern: /<a href=\(.*?\)\>(.*?)<\/a>/s,
    replace: '[url=$1]$2[/url]',
  },
  quote: {
    pattern: getStylablePattern('blockquote', 1),
    replace: getStylableReplacement('quote')
  },
  image: {
    pattern: /<img src=\(.*?\)\>/s,
    replace: '[img]$1[/img]',
  },
  youtube: {
    pattern: /<iframe width="560" height="315" src="\/\/www\.youtube\.com\/embed\/(.*?)" frameborder="0" allowfullscreen><\/iframe>/s,
    replace: '[youtube]$1[/youtube]',
  },
  linebreak: {
    pattern: /<br\s*\/?>/,
    replace: '/\r\n/',
  },
  sub: {
    pattern: getStylablePattern('sub', 1),
    replace: getStylableReplacement('sub')
  },
  sup: {
    pattern: getStylablePattern('sup', 1),
    replace: getStylableReplacement('sup')
  },
  small: {
    pattern: getStylablePattern('small', 1),
    replace: getStylableReplacement('small')
  },
  /*style: {
    pattern: getStylableHTMLPattern('style'),
    replace: getStylableReplacement('style', '$1', '$2')
  },*/
  p: {
    pattern: getStylablePattern('p', 1),
    replace: getStylableReplacement('p')
  },
  table: {
    pattern: getStylablePattern('table', 1),
    replace: getStylableReplacement('table')
  },
  tablerow: {
    pattern: getStylablePattern('tr', 1),
    replace: getStylableReplacement('tr')
  },
  tabledata: {
    pattern: getStylablePattern('td', 1),
    replace: getStylableReplacement('td')
  }
};


export function parse(source: string, parser: Record<string, parser>): string {
  for (var key in parser) {
    let value = parser[key];

    source = searchAndReplace(value['pattern'], value['replace'], source);
  }

  return source;
}


export function searchAndReplace(pattern: RegExp, replace: string, source: string): string {
  while (pattern.test(source)) {
    source = source.replace(pattern, replace);
  }

  return source;
}