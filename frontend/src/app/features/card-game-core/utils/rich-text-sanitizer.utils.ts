


export const RICH_TEXT_SANITIZER_DEFAULT_BBCODE_PATTERN: string = `\\[element\\]content\\[\\/element\\]`;

export const RICH_TEXT_SANITIZER_STYLABLE_BBCODE_PATTERN: string = `\\[element(?:\s*)?style\\]content\\[\\/element\\]`;
export const RICH_TEXT_SANITIZER_STYLABLE_HTML_PATTERN: string = `\\<element(?:\s*)?style\\>content\\<\\/element\\>`;

export const RICH_TEXT_SANITIZER_ATTRIBUTE_HTML_PATTERN: string = `attribute\\s*=\\s*"value"`;

// NOTE: We can always assume that there'll either be a semicolon or a quote because of the last one always ending that way else it's not value
// But group 2 would be for grabbingt he value
export const RICH_TEXT_SANITIZER_PROPERTY_CSS_PATTERN: string = `(?:property:\\s*value(?:;|"))`;

export const NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN: string = '(.*?)';
export const GREEDY_CAPTURING_GROUP_REGEX_PATTERN: string = '(.*)';
export const DIGIT_REGEX_PATTERN: string = '(\\d+)';

export const LENGTH_UNITS_REGEX_PATTERN: string = '-?\\d+(?:\\.\\d+)?(?:em|ex|%|px|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax)';

// https://regex101.com/r/CfTAlu/8
// https://regex101.com/r/CfTAlu/11

// TODO: Alignment values?
// https://developer.mozilla.org/en-US/docs/Web/CSS/align-items

export const ALIGNMENT_REGEX_PATTERN: string = '\\s*(?:left|right|normal|stretch|center|start|end|flex-start|flex-end|self-start|self-end|anchor-center|baseline|first baseline|last baseline|safe center|unsafe center)';

export const KEYWORDS_REGEX_PATTERN: string = '\\s*all|auto|inherit|initial|none|unset|revert|revert-layer';

// '(-?\\d+)(px|em|rem|%)|auto|inherit|initial';
export const DIMENSION_REGEX_PATTERN: string = `(${LENGTH_UNITS_REGEX_PATTERN}?|${KEYWORDS_REGEX_PATTERN})`;

// TODO: Separate length Regex Pattern? https://www.w3schools.com/cssref/css_units.php
export const BORDER_WIDTH_REGEX_PATTERN: string = `((\\s*${DIMENSION_REGEX_PATTERN}|(medium|thin|thick)\\s*){1,4})`;
export const BORDER_STYLE_REGEX_PATTERN: string = '\\s*((dotted|dashed|solid|double|groove|ridge|inset|outset|hidden)(\\s+(dotted|dashed|solid|double|groove|ridge|inset|outset|hidden)){0,3})\\s*';

// TODO: Potentially make auto|inherit|initial|unset|revert|revert-layer into its own Regex pattern?
export const SPACING_REGEX_PATTERN: string = `((\\s*${DIMENSION_REGEX_PATTERN}\\s*){1,4})`;
// `((\\s*(-?\\d+(?:\\.\\d+)?(?:px|em|rem|%)?|auto|inherit|initial|unset|revert|revert-layer)\\s*){1,4})`; 
// '(\\s*(-?\\d+(?:\\.\\d+)?(?:px|em|rem|%)?|auto|inherit|initial|unset|revert|revert-layer)(?:\\s+(-?\\d+(?:\\.\\d+)?(?:px|em|rem|%)?|auto|inherit|initial|unset|revert|revert-layer)(?:\\s+(-?\\d+(?:\\.\\d+)?(?:px|em|rem|%)?|auto|inherit|initial|unset|revert|revert-layer)(?:\\s+(-?\\d+(?:\\.\\d+)?(?:px|em|rem|%)|auto|inherit|initial|unset|revert|revert-layer))?)?)?\\s*)(?:;)?`;


/*
-?\d+(\.\d+)?(px|em|rem|%)        # a single value
(?:\s+-?\d+(\.\d+)?(px|em|rem|%)){0,3}   # up to three more, each preceded by space

Original regex treated whitespace as a possible value, not as a separator, which results in counting spaces between -0px tokens as separate “values” and miscounts overall numbers. 
*/

export const HEX_REGEX_PATTERN: string = '#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})';
export const RGBA_REGEX_PATTERN: string = 'rgba?\\(\\s*(?:\\d+%?|\\d*\\.\\d+%?)\\s*,\\s*(?:\\d+%?|\\d*\\.\\d+%?)\\s*,\\s*(?:\\d+%?|\\d*\\.\\d+%?)(?:\\s*,\\s*(?:\\d+|\\d*\\.\\d+))?\\s*\\)';
export const HSLA_REGEX_PATTERN: string = 'hsla?\\(\\s*(?:\\d+|\\d*\\.\\d+)\\s*,\\s*(?:\\d+%|\\d*\\.\\d+%)\\s*,\\s*(?:\\d+%|\\d*\\.\\d+%)(?:\\s*,\\s*(?:\\d+|\\d*\\.\\d+))?\\s*\\)';

// https://stackoverflow.com/a/9655186
// NOTE: Make sure when passing in for it, set the flag to i, it should already be case insensitive by default
// Instead have the words range from 7 - 21 letters, make it easier?

export const CSS_COLOR_NAMES_REGEX_PATTERN: string = '\\s*(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGray|DarkGrey|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkSlateGrey|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DimGrey|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gray|Grey|Green|GreenYellow|HoneyDew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGray|LightGrey|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSlateGrey|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|RebeccaPurple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|SlateGrey|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)';


export const CSS_COLOR_VALUE_REGEX_PATTERN: string = `(${CSS_COLOR_NAMES_REGEX_PATTERN}|${HEX_REGEX_PATTERN}|${RGBA_REGEX_PATTERN}|${HSLA_REGEX_PATTERN})`;


export function decodeHTMLEntities(text: string) {
  let textArea: HTMLTextAreaElement = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

// https://www.browserstack.com/guide/xss-testing

// https://owasp.org/www-community/attacks/xss/
// Look at alternative XSS attacks
// https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
// https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
// NOTE: We want to sanitise the style not necessarily HTML becaause Dompurify already handles that
export function sanitizeStyle(value: string): string {
  let styleAttrRegex: RegExp = new RegExp(`style="${NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN}"`, 'g');
  return value.replace(styleAttrRegex, (_match: string, styleContent: string) => {
    // Split style declarations: property: value;
    let declarations = styleContent.split(';').map((s: string) => s.trim()).filter(Boolean);

    // Filter + sanitize
    let sanitized: string[] = declarations
      .map((decl: string) => sanitizeCSSDeclaration(decl))
      .filter(Boolean) // remove disallowed styles (returned as empty strings)

    return sanitized.length > 0 ? `style="${sanitized.join('; ')};"` : '';
  });
}

// Example sanitizer: allow only specific properties
export function sanitizeCSSDeclaration(decl: string): string {
  // CHECKME: Do we need to encode the HTML Entities too just in case?

  // NOTE: We also want to decode the HTML eneities in case someone is passing in Javascript
  decl = decodeHTMLEntities(decl);
  console.log(`Decoded declaration - HTML Entities: ${decl}`);


  // NOTE: Again, this is so there won't be errors decoding it, like passing in hsla values by themselves to devcode is gonna call an error due to URI component checks including %
  decl = encodeURIComponent(decl);

  // NOTE: We decode the URI just in case if there's one being sent in
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURI
  decl = decodeURIComponent(decl);
  console.log(`Decoded declaration - URI Component: ${decl}`);

  // https://regex101.com/r/sohd0m/6 - Doesn't work
  // https://regex101.com/r/5isJsv/14
  let allowedProps: RegExp[] = [
    /animation(?:-(count|delay|direction|duration|function|fill|iteration|mode|name|play|state|timing)(?:-(count|delay|direction|duration|function|fill|iteration|mode|name|play|state|timing)(?:-(count|delay|direction|duration|function|fill|iteration|mode|name|play|state|timing))?)?)?$/,
    /background(?:-(attachment|blend|clip|color|image|mode|origin|position|repeat|size|x|y)(?:-(attachment|blend|clip|color|image|mode|origin|position|repeat|size|x|y))?)?$/, 
    /border(?:-(block|bottom|collapse|color|end|image|inline|left|outset|radius|repeat|right|slice|source|spacing|start|style|top|width)(?:-(block|bottom|collapse|color|end|image|inline|left|outset|radius|repeat|right|slice|source|spacing|start|style|top|width)(?:-(block|bottom|collapse|color|end|image|inline|left|outset|radius|repeat|right|slice|source|spacing|start|style|top|width))?)?)?$/, 
    /color/,
    /column(?:-(color|fill|gap|rule|span|style|width)(?:-(color|fill|gap|rule|span|style|width))?)?$/,
    /columns/, 
    /flex(?:-(basis|direction|flow|grow|shrink|wrap))?$/,
    /@?font(?:-(adjust|caps|face|family|feature|kerning|palette|settings|size|stretch|style|values|variant|weight)(?:-(adjust|caps|face|family|feature|kerning|palette|settings|size|stretch|style|values|variant|weight))?)?$/, 
    /gap/,
    /grid(?:-(area|areas|auto|column|columns|end|flow|row|rows|start|template)(?:-(area|areas|auto|column|columns|end|flow|row|rows|start|template))?)?$/, 
    /height/, 
    /left/, 
    /margin(?:-(block|bottom|end|inline|left|right|start|top)(?:-(block|bottom|end|inline|left|right|start|top))?)?$/, 
    /outline(?:-(color|offset|style|width))?$/,
    /padding(?:-(block|bottom|end|inline|left|right|start|top)(?:-(block|bottom|end|inline|left|right|start|top))?)?$/, 
    /right/,
    /scroll(?:-(align|behavior|block|bottom|end|inline|left|margin|padding|right|snap|start|stop|top|type)(?:-(align|behavior|block|bottom|end|inline|left|margin|padding|right|snap|start|stop|top|type)(?:-(align|behavior|block|bottom|end|inline|left|margin|padding|right|snap|start|stop|top|type))?)?)?$/, 
    /text(?:-(align|color|decoration|emphasis|indent|justify|last|line|offset|overflow|orientation|position|shadow|style|thickness|transform|underline)(?:-(align|color|decoration|emphasis|indent|justify|last|line|offset|overflow|orientation|position|shadow|style|thickness|transform|underline))?)?$/, 
    /top/,
    /width/
  ];

  let [property, value] = decl.split(':').map(s => s.trim());

  if (allowedProps.some(prop => prop.test(property)) && isSafeValue(value)) {
    return `${property}: ${value}`;
  }

  return '';
}

// Example safety check: no JS or expressions
export function isSafeValue(value: string): boolean {
  let safePatterns: RegExp[] = [
    getPattern(ALIGNMENT_REGEX_PATTERN),
    getPattern(BORDER_STYLE_REGEX_PATTERN),
    getPattern(BORDER_WIDTH_REGEX_PATTERN),
    getPattern(CSS_COLOR_VALUE_REGEX_PATTERN),
    getPattern(DIGIT_REGEX_PATTERN),
    getPattern(DIMENSION_REGEX_PATTERN),
    getPattern(SPACING_REGEX_PATTERN)
  ];

  return safePatterns.some(rx => rx.test(value));
}




// NOTE: Don't worry about the parsing and conversions to BBcode, just keep it in case though

// TODO: Move these later
export function getRandomColor(): string {
  let letters: string = '0123456789ABCDEF';
  let color: string = 'color:#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  color  += ";";
  return color;
}

// NOTE: Don't remove, might be useful in future
/*export function sanitizeCSS(css: string): string {
  let split: RegExp = new RegExp(`(${NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN}):(${GREEDY_CAPTURING_GROUP_REGEX_PATTERN})`, 'g');

  let matchesIterator: RegExpStringIterator<RegExpExecArray> = css.matchAll(split);
  console.log(`should match style pattern - all matches iterator ${JSON.stringify(matchesIterator)}`);

  let matchesArray: RegExpExecArray[] = [...matchesIterator];
  let matches: string[] = matchesArray.map(m => m[1]);

  // ASSUMPTION: 0th index is property, 1 is value
  let parser: parser = htmlParsers[matches[0]];

  console.log(`should sanitize margin - returned parser: ${JSON.stringify(parser)}`);
  console.log(`should sanitize margin - returned parser pattern source: ${JSON.stringify(parser.pattern.source)}`);

  if (!css.match(parser.pattern)) css = '';

  console.log(`should sanitize margin - final: ${css}`);

  return css;
}*/

// TODO: Put in separate file, and maybe change return type?
export function getMatches(value: string, regExp: RegExp): string[] {
  let matchesIterator: RegExpStringIterator<RegExpExecArray> = value.matchAll(regExp);
  console.log(`should match style pattern - all matches iterator ${JSON.stringify(matchesIterator)}`);

  let matchesArray: RegExpExecArray[] = [...matchesIterator];
  let matches: string[] = matchesArray.map(m => m[1]);

  if (!matches)
    console.warn(`No matches`);

  return matches;
}

// NOTE: Don't remove, might be useful in future
/*export function sanitizeStyle(value: string):string {
  // 1. Find all instances of style
  // CHECKME: Can we make sure that nothing else asides property uses this format of property: value;
  let style: RegExp = new RegExp(`style="${NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN}"`, 'g');
  let styles: string[] = getMatches(value, style);

  // 2. Go through them and loop through all the patterns and see if they match specifically for CSS and split those
  let css: RegExp = new RegExp(/([a-zA-Z\-]+:\s*[^;]+;)/, 'g');
  let properties: Map<number, string[]> = new Map();

  styles.forEach((value: string, index: number, array: string[]) => {
    let matchesIterator: RegExpStringIterator<RegExpExecArray> = value.matchAll(css);
    console.log(`should match css pattern and collect into array - all matches iterator ${JSON.stringify(matchesIterator)}`);

    let matchesArray: RegExpExecArray[] = [...matchesIterator];
    let matches: string[] = matchesArray.map(m => m[1]);

    console.log(`should match css pattern and collect into array - matches: ${JSON.stringify(matches)}`);

    properties.set(index, getMatches(value, css));
  });

  // 3. For each properties array, sanitize it
  properties.forEach((value: string[], key: number, map: Map<number, string[]>) => {
    value.forEach((property: string, index: number, array: string[]) => {
      let sanitised: string = sanitizeCSS(property);

      // Remove one element at index
      if (sanitised === '') array.splice(index, 1);
    });

    // 4. Use substrings to then replace it back into the original string
    // NOTE: We are assuming that the indices are the same and it'll always be in order
    let replacement: string = '';
    replacement = replacement.concat(...value);

    styles[key] = styles[key].replace(style, (!replacement || replacement === '') ? '' : `style="${replacement}"`);
  });

  // 5. How do we now replace value's styles with the stuff
  value.replace('', `$${0 + 1}`);
  return value;
}*/


// Outer nested is running before inner nested?
export function parse(source: string, parser: Record<string, parser>): string {
  console.log(`Before searching and replacing: ${source}`);

  for (let key in parser) {
    let value: parser = parser[key];

    source = searchAndReplace(value['pattern'], value['replace'], source);
  }

  console.log(`After searching and replacing: ${source}`);
  return source;
}


export function searchAndReplace(pattern: RegExp, replace: string, source: string): string {
  while (pattern.test(source)) {
    source = source.replace(pattern, replace);
  }

  return source;
}


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

export const format = (template: string, replacements: Map<RegExp | string, string>): string => {
  replacements.forEach((value: string, key: string | RegExp) => {
    console.log(`\nFormat: Replace ${key} with ${value}\n`);

    template = template.replace(key, value);
  });

  console.log(`\nFormatted replaced placeholder: ${template}\n`);

  return template;
}

export function getPattern(regExp: RegExp | string, flags: string = 'gim'): RegExp {
  return new RegExp(regExp, flags);
}

export function getReplacement(template: string, replacements: Map<RegExp | string, string>): string {
  return format(template, replacements);
}

export function getDefaultBBCodePattern(element: string, content: string = GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = RICH_TEXT_SANITIZER_DEFAULT_BBCODE_PATTERN): RegExp {
  return getPattern(format(template, new Map([
    [/element/g, element],
    [/content/g, content]
  ])));
}

export function getStylablePattern(element: string, markupReadingFrom: number = 0, style: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, content: string = GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = ``): RegExp {
  let replacements: Map<RegExp | string, string> = new Map([
    [/element/g, element],
    [/style/g, style],
    [/content/g, content]
  ]);

  if (template != "") {
    return getPattern(format(template, replacements));
  }

  switch (markupReadingFrom) {
    case 1:
       return getPattern(format(RICH_TEXT_SANITIZER_STYLABLE_HTML_PATTERN, replacements));
    default:
      return getPattern(format(RICH_TEXT_SANITIZER_STYLABLE_BBCODE_PATTERN, replacements));
  }
}

export function getStylableReplacement(element: string, markupConvertingTo: number = 0, style: string = '$1', content: string ='$2', template: string = ``): string {
  let replacements: Map<RegExp | string, string> = new Map([
    [/\$\{element\}/g, element],
    [/\$\{style\}/g, style],
    [/\$\{content\}/g, content]
  ]);
  
  if (template != "") {
    return getReplacement(template, replacements);
  }

  switch (markupConvertingTo) {
    case 1: // HTML
      let final: string = getReplacement(`<${'${element}'}${'${style}'}>${'${content}'}</${'${element}'}>`, replacements);
      console.log(`Stylable replacement HTML: ${final}`);
      return final;
    default: // BBCode
      let bbcode = getReplacement(`[${'${element}'}${'${style}'}]${'${content}'}[/${'${element}'}]`, replacements);
      console.log(`Stylable replacement BBCode: ${bbcode}`);
      return bbcode;
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

export function getStylableBBCodePattern(element: string, style: string = GREEDY_CAPTURING_GROUP_REGEX_PATTERN, content: string = GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = RICH_TEXT_SANITIZER_STYLABLE_BBCODE_PATTERN): RegExp {
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

export function getStylableHTMLPattern(element: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, style: string = GREEDY_CAPTURING_GROUP_REGEX_PATTERN, content: string = GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = RICH_TEXT_SANITIZER_STYLABLE_HTML_PATTERN): RegExp {
  return getPattern(format(template, new Map([
    [/element/g, element],
    [/style/g, style],
    [/content/g, content]
  ])));
}

export function getCSSHTMLPattern(property: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, value: string = GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = RICH_TEXT_SANITIZER_PROPERTY_CSS_PATTERN): RegExp {
  return getPattern(format(template, new Map([
    [/property/g, property],
    [/value/g, value]
  ])));


  /*let pattern: RegExp = getPattern(format(template, new Map([
    [/property/g, property],
    [/value/g, value]
  ])));

  console.log(`\ngetCSSHTMLPattern: RegExp pattern: ${pattern} for ${property}\n`);

  return pattern;*/

  // return new RegExp(`(?:${property}:\\s*${content})(?:;|")`, 'gis');
  // return new RegExp(`(?:^${property}: ${content};?)|(?:.+${property}: ${content};)`, 'gis');
}

export function getAttributeHTMLPattern(attribute: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, value: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = RICH_TEXT_SANITIZER_ATTRIBUTE_HTML_PATTERN): RegExp {
  return getPattern(format(template, new Map([
    [/attribute/g, attribute],
    [/value/g, value]
  ])));
}

/* 
1. Key value pair for specifically name of format: attribute/property format
2. Function to check specifically the pattern it's in
3. Pass in the template and the attribute/property as parameters
4. We loop through the map, we pass in the template as the value and property/attribute as the property/attribute
5. Check and see if it matches, if it does, return, else we just return null?

Map<string, RegExp>

*/

export function getAttributeMarkupPattern(attribute: string, value: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, template: string = RICH_TEXT_SANITIZER_ATTRIBUTE_HTML_PATTERN): RegExp | undefined {
  let patterns: Map<string, RegExp> = new Map<string, RegExp>([
    ['css', getCSSHTMLPattern(attribute, value, template)],
    ['html', getAttributeHTMLPattern(attribute, value, template)]
  ]);

  patterns.forEach((value: RegExp, key: string) => {

  });

  return undefined;
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

// TODO: Maybe only trigger based on whether there's a space

// FIXME: The inner nested properties aren't converting before the outer ones
// Bold inside of blockquote makes it so that bold gets detected, but blockquote doesn't

// TODO: Make a custom sanitizer, and use all the patterns to compare, and sanitize that way, instead of using them for the pattern here
// TODO: If a CSS property is outside an HTML element, during the sanitization, just strip it out entirely
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
    replace: getCSSHTMLReplacement('border-color', '$2')
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
    pattern: getDefaultBBCodePattern('margin', SPACING_REGEX_PATTERN),
    replace: getCSSHTMLReplacement('margin', '$1')
  },
  padding: {
    pattern: getDefaultBBCodePattern('padding', SPACING_REGEX_PATTERN),
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

// https://tomassetti.me/parsing-in-javascript/
/* 
COMPARE OP: ≠

VARIABLE NAME: A  →
VARIABLE NAME: B →
CONSTANT VALUE: 0 →
*/

// https://www.npmjs.com/package/css-tree
// https://www.npmjs.com/package/htmlparser2
// https://github.com/inikulin/parse5

// https://chatgpt.com/share/688fbf04-e69c-800c-8701-5d9cad8736ee

// https://stackoverflow.com/questions/3160794/alternative-parsing-methods
export const htmlParsers: Record<string, parser> = {
  size: {
    pattern: getAttributeHTMLPattern('size', DIGIT_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('size', '$1')
  },
  border: {
    pattern: getCSSHTMLPattern('border'),
    replace: getDefaultBBCodeReplacement('border', '$2')
  },
  borderwidth: {
    pattern: getCSSHTMLPattern('border-width'),
    replace: getDefaultBBCodeReplacement('border-width', '$1')
  },
  borderstyle: {
    pattern: getCSSHTMLPattern('border-style', BORDER_STYLE_REGEX_PATTERN), 
    replace: getDefaultBBCodeReplacement('border-style', '$2')
  },
  bordercolor: {
    pattern: getCSSHTMLPattern('border-color', CSS_COLOR_VALUE_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('border-color', '$2')
  },
  attrcolor: {
    pattern: getAttributeHTMLPattern('color',  CSS_COLOR_VALUE_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('attrcolor', '$1')
  },
  margin: {
    pattern: getCSSHTMLPattern('margin', SPACING_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('margin', '$1')
  },
  padding: {
    pattern: getCSSHTMLPattern('padding', SPACING_REGEX_PATTERN),
    replace: getDefaultBBCodeReplacement('padding', '$2')
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