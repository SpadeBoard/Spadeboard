import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFaceElementRteComponent } from './card-face-element-rte.component';

import { bbCodeParsers, format, getPattern, htmlParsers, NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN, parse, RICH_TEXT_SANITIZER_PROPERTY_CSS_PATTERN, parser, GREEDY_CAPTURING_GROUP_REGEX_PATTERN, sanitizeStyle, sanitizeCSSDeclaration, decodeHTMLEntities } from '../../../../../utils/rich-text-sanitizer.utils';

describe('CardFaceElementRteComponent', () => {
  let component: CardFaceElementRteComponent;
  let fixture: ComponentFixture<CardFaceElementRteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFaceElementRteComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CardFaceElementRteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should match css patterns', () => {
    let property: string = 'margin';
    let value: string = NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN;
    let template: string = RICH_TEXT_SANITIZER_PROPERTY_CSS_PATTERN;

    let assert: RegExp = getPattern(format(template, new Map([
      [/property/g, property],
      [/value/g, value]
    ])));

    let expected: RegExp = new RegExp(`(?:${property}:\\s*${value}(?:;|"))`, 'gis');

    expect(assert.source).toBe(expected.source);
  });

  it('should convert bolded bbcode to html', () => {
    let bbcode: string = '[b]BORDER[/b]';
    let expectedHtml: string = '<b>BORDER</b>';

    let result: string = parse(bbcode, bbCodeParsers);

    console.log(`should convert bolded bbcode to html: ${result}`);

    expect(result).toBe(expectedHtml);
  });

  it('should convert bolded html to bbcode', () => {
    let expectedBBCode: string = '[b]BORDER[/b]';
    let html: string = '<b>BORDER</b>';

    let result: string = parse(html, htmlParsers);

    console.log(`should convert bolded html to bbcode: ${result}`);

    expect(result).toBe(expectedBBCode);
  });

  it('should convert nested blockquote with content bbcode to html', () => {
    let bbcode: string = '[quote][b]BORDER[/b][/quote]';
    let expectedHtml: string = '<blockquote><b>BORDER</b></blockquote>';

    let result: string = parse(bbcode, bbCodeParsers);

    console.log(`should convert nested blockquote with content bbcode to html: ${result}`);

    expect(result).toBe(expectedHtml);
  });

  /*it('should convert nested blockquote with content html to bbcode', () => {
    let expectedBBCode: string = '[quote][b]BORDER[/b][/quote]';
    let html: string = '<blockquote><b>BORDER</b></blockquote>';

    let result: string = parse(html, htmlParsers);

    console.log(`should convert nested blockquote with content html to bbcode: ${result}`);

    expect(result).toBe(expectedBBCode);
  });*/

  it('should convert margin from bbcode to html', () => {
    let bbcode: string = '[margin]0 0 0 40px[/margin]';
    let expectedHTML: string = 'margin: 0 0 0 40px;';

    let result: string = parse(bbcode, bbCodeParsers);
    console.log(`should convert margin from bbcode to html: ${result}`);

    expect(result).toBe(expectedHTML);
  });

  it('should convert margin from html to bbcode', () => {
    let html: string = 'margin: 0 0 0 40px;';
    let expectedBBCode: string = '[margin]0 0 0 40px[/margin]';

    let result: string = parse(html, htmlParsers);
    console.log(`should convert margin from html to bbcode: ${result}`);

    expect(result).toBe(expectedBBCode);
  });

  it('should convert nested blockquote with margin and padding bbcode to html', () => {
    let bbcode: string = '[quote style="[margin]0 0 0 40px[/margin] [border]none[/border] [padding]0px[/padding]"][b]BORDER[/b][/quote]';
    let expectedHtml: string = '<blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;"><b>BORDER</b></blockquote>';

    let result: string = parse(bbcode, bbCodeParsers);
    console.log(`should convert nested blockquote with margin and padding bbcode to html: ${result}`);

    expect(result).toBe(expectedHtml);
  });

  /*it('should convert nested blockquote with margin and padding html to bbcode', () => {
    let expectedBBCode: string = '[quote style="[margin]0 0 0 40px[/margin] [border]none[/border] [padding]0px[/padding]"][b]BORDER[/b][/quote]';
    let html: string = '<blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;"><b>BORDER</b></blockquote>';

    let result: string = parse(html, htmlParsers);
    console.log(`should convert nested blockquote with margin and padding html to bbcode: ${result}`);

    expect(result).toBe(expectedBBCode);
  });*/

  it('should convert nested bold with margin and padding bbcode to html', () => {
    let bbcode: string = '[b style="[margin]0 0 0 40px[/margin] [border]none[/border] [padding]0px[/padding]"]BORDER[/b]';
    let expectedHtml: string = '<b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b>';

    let result: string = parse(bbcode, bbCodeParsers);
    console.log(`should convert nested bold with margin and padding bbcode to html: ${result}`);

    expect(result).toBe(expectedHtml);
  });

  /*it('should convert nested bold with margin and padding html to bbcode', () => {
    let expectedBBCode: string = '[b style="[margin]0 0 0 40px[/margin] [border]none[/border] [padding]0px[/padding]"]BORDER[/b]';
    let html: string = '<b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b>';

    let result: string = parse(html, htmlParsers);
    console.log(`should convert nested bold with margin and padding html to bbcode: ${result}`);

    expect(result).toBe(expectedBBCode);
  });*/

  it('should match style pattern', () => {
    // 1. Find all instances of style
    let value: string = '<blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>';
    let style: RegExp = new RegExp(`style="${NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN}"`, 'g');

    let matchesIterator: RegExpStringIterator<RegExpExecArray> = value.matchAll(style);
    console.log(`should match style pattern - all matches iterator ${JSON.stringify(matchesIterator)}`);

    let matchesArray: RegExpExecArray[] = [...matchesIterator];
    let matches: string[] = matchesArray.map(m => m[1]);

    console.log(`should match style pattern - matches: ${JSON.stringify(matches)}`);

    expect(matches).toEqual([
      "margin: 0 0 0 40px; border: none; padding: 0px;",
      "margin: 0 0 0 40px; border: none; padding: 0px;"
    ]);
  });

  it('should match css pattern and collect into array', () => {
    // NOTE: Style matches
    let styles: string[] = [
      "margin: 0 0 0 40px; border: none; padding: 0px;",
      "margin: 0 0 0 40px; border: none; padding: 0px;"
    ];

    /*
    [a-zA-Z\-]+: = property name and colon
    \s* = optional spaces after colon
    [^;]+ = property value up to
    ; = semicolon

    Problem is semicolon could be optional if it's at the end and there's nothing else, so what
    */
    let css: RegExp = new RegExp(/([a-zA-Z\-]+:\s*[^;]+;)/, 'g');

    let properties: Map<number, string[]> = new Map();

    styles.forEach((value: string, index: number, array: string[]) => {
      let matchesIterator: RegExpStringIterator<RegExpExecArray> = value.matchAll(css);
      console.log(`should match css pattern and collect into array - all matches iterator ${JSON.stringify(matchesIterator)}`);

      let matchesArray: RegExpExecArray[] = [...matchesIterator];
      let matches: string[] = matchesArray.map(m => m[1]);

      console.log(`should match css pattern and collect into array - matches: ${JSON.stringify(matches)}`);

      properties.set(index, matches);
    });

    expect(properties).toEqual(new Map<number, string[]>(
      [
        [0, [
          "margin: 0 0 0 40px;",
          "border: none;",
          "padding: 0px;",
        ]],
        [
          1, [
            "margin: 0 0 0 40px;",
            "border: none;",
            "padding: 0px;"
          ]]
    ]));
  });

  it('should sanitize margin', () => {
    let value: string = "margin: eesesrrsrrseesr;";
    value = sanitizeCSSDeclaration(value);

    /*let split: RegExp = new RegExp(`(${NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN}):(${GREEDY_CAPTURING_GROUP_REGEX_PATTERN})`, 'g');

    let matchesIterator: RegExpStringIterator<RegExpExecArray> = value.matchAll(split);
    console.log(`should match style pattern - all matches iterator ${JSON.stringify(matchesIterator)}`);

    let matchesArray: RegExpExecArray[] = [...matchesIterator];
    let matches: string[] = matchesArray.map(m => m[1]);

    // ASSUMPTION: 0th index is property, 1 is value
    let parser: parser = htmlParsers[matches[0]];

    console.log(`should sanitize margin - returned parser: ${JSON.stringify(parser)}`);
    console.log(`should sanitize margin - returned parser pattern source: ${JSON.stringify(parser.pattern.source)}`);

    if (!value.match(parser.pattern)) value = '';*/

    console.log(`should sanitize margin - final: ${value}`);
    expect(value).toEqual('');
  });

  it('should not sanitize margin', () => {
    let value: string = "margin: 0 0 0 40px";
    value = sanitizeCSSDeclaration(value);
    /*let split: RegExp = new RegExp(`(${NON_GREEDY_CAPTURING_GROUP_REGEX_PATTERN}):(${GREEDY_CAPTURING_GROUP_REGEX_PATTERN})`, 'g');

    let matchesIterator: RegExpStringIterator<RegExpExecArray> = value.matchAll(split);
    console.log(`should match style pattern - all matches iterator ${JSON.stringify(matchesIterator)}`);

    let matchesArray: RegExpExecArray[] = [...matchesIterator];
    let matches: string[] = matchesArray.map(m => m[1]);

    // ASSUMPTION: 0th index is property, 1 is value
    let parser: parser = htmlParsers[matches[0]];

    console.log(`should not sanitize margin - value: ${value}, matches: ${JSON.stringify(matches)}, returned parser: ${JSON.stringify(parser)}, returned parser pattern source: ${JSON.stringify(parser.pattern.source)}`);

    if (!value.match(parser.pattern)) value = '';*/

    console.log(`should not sanitize margin - final: ${value}`);
    expect(value).toEqual('margin: 0 0 0 40px');
  });

  it('should sanitize margin of encoded html entities', () => {
    let value: string = "margin: j&#X41vascript:alert();";
    value = sanitizeCSSDeclaration(value);

    console.log(`should sanitize margin of encoded html entities - final: ${value}`);
    expect(value).toEqual('');
  });
  
  it ('should not sanitize style', () => {
    let value: string = '<blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>';
    value = sanitizeStyle(value);

    console.log(`should not sanitize style - ${value}`);
    expect(value).toEqual('<blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>');
  });

  it ('should sanitize https for style', () => {
    let value: string = '<blockquote style="margin: https://youtu.be/PSL1mvSEdAo?si=FSnG76r8u_VWgyZR; border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>';
    value = sanitizeStyle(value);

    console.log(`should sanitize https for style - ${value}`);
    expect(value).toEqual('<blockquote style="border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>');
  });

  it ('should sanitize encoded html entities for style', () => {
    let value: string = '<blockquote style="margin: j&#X41vascript:alert(); border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>';
    value = sanitizeStyle(value);

    console.log(`should sanitize encoded html entities for style - ${value}`);
    expect(value).toEqual('<blockquote style="border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>');
  });

  it ('should sanitize http for style', () => {
    let value: string = '<blockquote style="margin: http://url.to.file.which/not.exist; border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>';
    value = sanitizeStyle(value);

    console.log(`should sanitize http for style - ${value}`);
    expect(value).toEqual('<blockquote style="border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>');
  });

  it ('should sanitize script for style', () => {
    let value: string = '<blockquote style="margin: <script>...</script>; border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>';
    value = sanitizeStyle(value);

    console.log(`should sanitize script for style - ${value}`);
    expect(value).toEqual('<blockquote style="border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>');
  });

  it ('should sanitize script that steals user cookies for style', () => {
    let value: string = '<blockquote style="margin: http://attacker.com/steal.php?cookie=; border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>';
    value = sanitizeStyle(value);

    console.log(`should sanitize script that steals user cookies for style - ${value}`);
    expect(value).toEqual('<blockquote style="border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>');
  });

  it ('should sanitize script that redirects user for style', () => {
    let value: string = '<blockquote style="margin: http://attacker.com/malicious.html; border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>';
    value = sanitizeStyle(value);

    console.log(`should sanitize script that redirects user for style - ${value}`);
    expect(value).toEqual('<blockquote style="border: none; padding: 0px;"><b style="margin: 0 0 0 40px; border: none; padding: 0px;">BORDER</b></blockquote>');
  });

  it ('should decode html entities', () => {
    let value: string = 'j&#X41vascript:alert()';

    value = decodeHTMLEntities(value);

    console.log(`should decode html entities:' ${value}`);

    expect(value).toEqual('jAvascript:alert()');
  });

  it('should not sanitize border color color name', () => {
    let value: string = "border-color: red;";
    value = sanitizeCSSDeclaration(value);

    console.log(`should not sanitize border color color name - final: ${value}`);
    expect(value).toEqual('border-color: red;');
  });

  it('should not sanitize border color rgb', () => {
    let value: string = "border-color: rgb(127, 127, 127);";
    value = sanitizeCSSDeclaration(value);

    console.log(`should not sanitize border color rgb - final: ${value}`);
    expect(value).toEqual('border-color: rgb(127, 127, 127);');
  });

  it('should not sanitize border color rgba', () => {
    let value: string = "border-color: rgba(127, 127, 127, 0.5);";
    value = sanitizeCSSDeclaration(value);

    console.log(`should not sanitize border color rgba - final: ${value}`);
    expect(value).toEqual('border-color: rgba(127, 127, 127, 0.5);');
  });

  it('should not sanitize border color hsl', () => {
    let value: string = "border-color: hsl(0, 0%, 20%);";
    value = sanitizeCSSDeclaration(value);

    console.log(`should not sanitize border color hsl - final: ${value}`);
    expect(value).toEqual('border-color: hsl(0, 0%, 20%);');
  });

  it('should not sanitize border color hsla', () => {
    let value: string = "border-color: hsla(0, 0%, 20%, 0.5);";
    value = sanitizeCSSDeclaration(value);

    console.log(`should not sanitize border color hsla - final: ${value}`);
    expect(value).toEqual('border-color: hsla(0, 0%, 20%, 0.5);');
  });

  it('should not sanitize text align center', () => {
    let value: string = "text-align: center;";
    value = sanitizeCSSDeclaration(value);

    console.log(`'should not sanitize text align center - final: ${value}`);
    expect(value).toEqual('text-align: center;');
  });

  it ('should not sanitize border width medium', () => {
    let value: string = "border-width: medium;";
    value = sanitizeCSSDeclaration(value);

    console.log(`should not sanitize border width medium: ${value}`);
    expect(value).toEqual('border-width: medium;');
  });

  it ('should not sanitize border width with four valid values', () => {
    let value: string = "border-width: thin medium thick 10px;";
    value = sanitizeCSSDeclaration(value);

    console.log(`should not sanitize border width four valid values: ${value}`);
    expect(value).toEqual('border-width: thin medium thick 10px;');
  });

  it ('should not sanitize border: none', () => {
    let value: string = "border: none;";
    value = sanitizeCSSDeclaration(value);

    console.log(`should not sanitize border: none: ${value}`);
    expect(value).toEqual('border: none;');
  });

  it ('should not sanitize border-inline-end-style', () => {
    let value: string = "border-inline-end-style: dotted;";
    value = sanitizeCSSDeclaration(value);

    console.log(`should not sanitize border border-inline-end-style: ${value}`);
    expect(value).toEqual('border-inline-end-style: dotted;');
  });

  it ('should sanitize border-align-end-style', () => {
    let value: string = "border-align-end-style: dotted;";
    value = sanitizeCSSDeclaration(value);

    console.log(`should sanitize border border-align-end-style: ${value}`);
    expect(value).toEqual('');
  });
});
