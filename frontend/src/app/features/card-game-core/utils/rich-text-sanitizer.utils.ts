// https://www.npmjs.com/package/html2bbcode
// https://github.com/JiLiZART/bbob
// https://codepen.io/JiLiZART/full/vzMvpd
// https://github.com/donnikitos/AngularJS-BBcode
// https://github.com/thoughtsunificator/bbcode-parser
// https://bbcode-parser-template.unificator.me/module-template-Template.html
// https://github.com/thoughtsunificator/bbcode-parser-template-demo
/*import { Parser, BBElement, BBDocument, Conversion } from '@thoughtsunificator/bbcode-parser';
import { Code, Template } from '@thoughtsunificator/bbcode-parser-template'*/
import { Style } from '../../style/models/style';
import { DndPosition } from '../../drag-and-drop/models/dnd-types';

// TODO: Make a class that extends Node, then use that to pass in first argument for template

// https://stackoverflow.com/questions/69269283/how-to-get-document-object-in-angular-component

// CHECKME: What about the positioning
export function htmlToBBCode(html: string): string {
    return parse(html, htmlParsers);
}

// https://github.com/genert/bbcode
// https://github.com/genert/bbcode/blob/master/src/Parser/BBCodeParser.php
export interface parser {
  pattern: RegExp;
  replace: string;
  content?: string;
}

// FIXME: The YouTube embedding width and height and is gonna differ depending on the Angular Editor
// TODO: Font size - https://www.bbcode.org/changing-the-font-size-with-bbcode.php
export const bbCodeParsers: Record<string, parser> = {
  h1: {
    pattern: /\[h1\](.*?)\[\/h1\]/s,
    replace: '<h1>$1</h1>',
    // content: '$1'
  },
  h2: {
    pattern: /\[h2\](.*?)\[\/h2\]/s,
    replace: '<h2>$1</h2>',
    // content: '$1'
  },
  h3: {
    pattern: /\[h3\](.*?)\[\/h3\]/s,
    replace: '<h3>$1</h3>',
    // content: '$1'
  },
  h4: {
    pattern: /\[h4\](.*?)\[\/h4\]/s,
    replace: '<h4>$1</h4>',
    // content: '$1'
  },
  h5: {
    pattern: /\[h5\](.*?)\[\/h5\]/s,
    replace: '<h5>$1</h5>',
    // content: '$1'
  },
  h6: {
    pattern: /\[h6\](.*?)\[\/h6\]/s,
    replace: '<h6>$1</h6>',
    // content: '$1'
  },
  bold: {
    pattern: /\[b\](.*?)\[\/b\]/s,
    replace: '<b>$1</b>',
    // content: '$1'
  },
  italic: {
    pattern: /\[i\](.*?)\[\/i\]/s,
    replace: '<i>$1</i>',
    // content: '$1'
  },
  underline: {
    pattern: /\[u\](.*?)\[\/u\]/s,
    replace: '<u>$1</u>',
    // content: '$1'
  },
  strikethrough: {
    pattern: /\[s\](.*?)\[\/s\]/s,
    replace: '<s>$1</s>',
    // content: '$1'
  },
  quote: {
    pattern: /\[quote\](.*?)\[\/quote\]/s,
    replace: '<blockquote>$1</blockquote>',
    // content: '$1'
  },
  link: {
    pattern: /\[url\](.*?)\[\/url\]/s,
    replace: '<a href=\'$1\'>$1</a>',
    // content: '$1'
  },
  namedlink: {
    pattern: /\[url=(.*?)\](.*?)\[\/url\]/s,
    replace: '<a href=\'$1\'>$2</a>',
    content: '$2'
  },
  image: {
    pattern: /\[img\](.*?)\[\/img\]/s,
    replace: '<img src=\'$1\'>',
    // content: '$1'
  },
  orderedlistnumerical: {
    pattern: /\[list=1\](.*?)\[\/list\]/s,
    replace: '<ol>$1</ol>',
    // content: '$1'
  },
  orderedlistalpha: {
    pattern: /\[list=a\](.*?)\[\/list\]/s,
    replace: '<ol type=a>$1</ol>',
    // content: '$1'
  },
  unorderedlist: {
    pattern: /\[list\](.*?)\[\/list\]/s,
    replace: '<ul>$1</ul>',
    // content: '$1'
  },
  listitem: {
    pattern: /\[\*\](.*)/,
    replace: '<li>$1</li>',
    // content: '$1'
  },
  code: {
    pattern: /\[code\](.*?)\[\/code\]/s,
    replace: '<code>$1</code>',
    // content: '$1'
  },
  youtube: {
    pattern: /\[youtube\](.*?)\[\/youtube\]/s,
    replace: '<iframe width=560 height=315 src=//www.youtube-nocookie.com/embed/$1 frameborder=0 allowfullscreen></iframe>',
    // content: '$1'
  },
  sub: {
    pattern: /\[sub\](.*?)\[\/sub\]/s,
    replace: '<sub>$1</sub>',
    // content: '$1'
  },
  sup: {
    pattern: /\[sup\](.*?)\[\/sup\]/s,
    replace: '<sup>$1</sup>',
    // content: '$1'
  },
  small: {
    pattern: /\[small\](.*?)\[\/small\]/s,
    replace: '<small>$1</small>',
    // content: '$1'
  },
  table: {
    pattern: /\[table\](.*?)\[\/table\]/s,
    replace: '<table>$1</table>',
    // content: '$1'
  },
  tablerow: {
    pattern: /\[tr\](.*?)\[\/tr\]/s,
    replace: '<tr>$1</tr>',
    // content: '$1'
  },
  tabledata: {
    pattern: /\[td\](.*?)\[\/td\]/s,
    replace: '<td>$1</td>',
    // content: '$1'
  }
};

export const htmlParsers: Record<string, parser> = {
  h1: {
    pattern: /<h1>(.*?)<\/h1>/s,
    replace: '[h1]$1[/h1]',
    // content: '$1'
  },
  h2: {
    pattern: /<h2>(.*?)<\/h2>/s,
    replace: '[h2]$1[/h2]',
    // content: '$1'
  },
  h3: {
    pattern: /<h3>(.*?)<\/h3>/s,
    replace: '[h3]$1[/h3]',
    // content: '$1'
  },
  h4: {
    pattern: /<h4>(.*?)<\/h4>/s,
    replace: '[h4]$1[/h4]',
    // content: '$1'
  },
  h5: {
    pattern: /<h5>(.*?)<\/h5>/s,
    replace: '[h5]$1[/h5]',
    // content: '$1'
  },
  h6: {
    pattern: /<h6>(.*?)<\/h6>/s,
    replace: '[h6]$1[/h6]',
    // content: '$1'
  },
  bold: {
    pattern: /<b>(.*?)<\/b>/s,
    replace: '[b]$1[/b]',
    // content: '$1'
  },
  strong: {
    pattern: /<strong>(.*?)<\/strong>/s,
    replace: '[b]$1[/b]',
    // content: '$1'
  },
  italic: {
    pattern: /<i>(.*?)<\/i>/s,
    replace: '[i]$1[/i]',
    // content: '$1'
  },
  em: {
    pattern: /<em>(.*?)<\/em>/s,
    replace: '[i]$1[/i]',
    // content: '$1'
  },
  underline: {
    pattern: /<u>(.*?)<\/u>/s,
    replace: '[u]$1[/u]',
    // content: '$1'
  },
  strikethrough: {
    pattern: /<s>(.*?)<\/s>/s,
    replace: '[s]$1[/s]',
    // content: '$1'
  },
  del: {
    pattern: /<del>(.*?)<\/del>/s,
    replace: '[s]$1[/s]',
    // content: '$1'
  },
  code: {
    pattern: /<code>(.*?)<\/code>/s,
    replace: '[code]$1[/code]',
    // content: '$1'
  },
  orderedlistnumerical: {
    pattern: /<ol>(.*?)<\/ol>/s,
    replace: '[list=1]$1[/list]',
    // content: '$1'
  },
  unorderedlist: {
    pattern: /<ul>(.*?)<\/ul>/s,
    replace: '[list]$1[/list]',
    // content: '$1'
  },
  listitem: {
    pattern: /<li>(.*?)<\/li>/s,
    replace: '[*]$1',
    // content: '$1'
  },
  link: {
    pattern: /<a href=\(.*?\)\>(.*?)<\/a>/s,
    replace: '[url=$1]$2[/url]',
    // content: '$1'
  },
  quote: {
    pattern: /<blockquote>(.*?)<\/blockquote>/s,
    replace: '[quote]$1[/quote]',
    // content: '$1'
  },
  image: {
    pattern: /<img src=\(.*?\)\>/s,
    replace: '[img]$1[/img]',
    // content: '$1'
  },
  youtube: {
    pattern: /<iframe width="560" height="315" src="\/\/www\.youtube\.com\/embed\/(.*?)" frameborder="0" allowfullscreen><\/iframe>/s,
    replace: '[youtube]$1[/youtube]',
    // content: '$1'
  },
  linebreak: {
    pattern: /<br\s*\/?>/,
    replace: '/\r\n/',
    // content: '$1'
  },
  sub: {
    pattern: /<sub>(.*?)<\/sub>/s,
    replace: '[sub]$1[/sub]',
    // content: '$1'
  },
  sup: {
    pattern: /<sup>(.*?)<\/sup>/s,
    replace: '[sup]$1[/sup]',
    // content: '$1'
  },
  small: {
    pattern: /<small>(.*?)<\/small>/s,
    replace: '[small]$1[/small]',
    // content: '$1'
  },
  table: {
    pattern: /<table>(.*?)<\/table>/s,
    replace: '[table]$1[/table]',
    // content: '$1'
  },
  tablerow: {
    pattern: /<tr>(.*?)<\/tr>/s,
    replace: '[tr]$1[/tr]',
    // content: '$1'
  },
  tabledata: {
    pattern: /<td>(.*?)<\/td>/s,
    replace: '[td]$1[/td]',
    // content: '$1'
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

export function bbCodeParser(html: string): bbCode {
  let bbCode: bbCode = {
    // tag: '',
    attrs: {
      style: {
        styleId: "0"
      },
      dndPosition: {
        x: 0,
        y: 0,
        dndPositionId: "0"
      }
    },
    content: []
  };

  return bbCode;
}

// CHECKME: What about the positioning
export function bbCodeToHtml(bbCode: string): string {
  return parse(bbCode, bbCodeParsers);
}

export interface html {
  content: string,
  attrs: {
    style: Style,
    dndPosition: DndPosition
  }
}

// ASSUMPTION: Is a JSON object of the BBCode, but BBCode itself should already be a string, will be wrapped up in a span or div
// Take in original card face element content pass in for the content here and then pass in the card face element style and dnd position
export interface bbCode {
    // tag: string,
    attrs: {
        style: Style,
        dndPosition: DndPosition
    }
    content: (string | bbCode)[]
}

export function decodeHtml(input: string) : string | null {
  return new DOMParser().parseFromString(input, "text/html").documentElement.textContent;
}

// https://en.wikipedia.org/wiki/BBCode
// TODO: Create a BBCode interface
/* 
Style object,
DndPosition object
*/
/*
[
  {
    tag: span,
    attrs: {
      style: font-weight: bold;
    },
    content: [
      ANGULAR
    ]
  },
  \n,
  {
    tag: span,
    attrs: {
      style: font-style: italic;
    },
    content: [
      ANGULAR
    ]
  }
]

[b]ANGU[i]L[/i]AR[/b][i]ANGULAR[/i]
[
  {
    tag: span,
    attrs: {
      style: font-weight: bold;
    },
    content: [
      ANGU,
      {
        tag: span,
        attrs: {
          style: font-style: italic;
        },
        content: [
          L
        ]
      },
      AR
    ]
  },
  {
    tag: span,
    attrs: {
      style: font-style: italic;
    },
    content: [
      ANGULAR
    ]
  }
]
*/