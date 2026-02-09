import type { Theme } from '../../../../native-elements';

export type Position = {
  state: string;
  translate: {
    dx: number;
    dy: number;
  };
  scale: number;
  rotate: string;
  textSize?: number;
};

export type TspanType = {
  anchor: string;
  title: string;
  x: number;
  y: number;
};

export type NodeType = {
  cx: string;
  cy: string;
  r: string;
  fill: string;
};

export type TextType = {
  fill: string;
  size?: number;
  tspans?: TspanType[];
  transform?: string;
};

export type SkillprintTabStates = 'reset' | 'skills' | 'mindsets' | 'traits';

export type BaseSpAttrType = {
  id: number;
  group: string;
  slug: string;
  text: TextType;
  node: NodeType;
  path: {
    d: string;
    stroke: string;
    strokeWidth: string;
  };
};

export type SkillprintStateType = {
  outerRing: {
    cx: string;
    cy: string;
    r: string;
    stroke: string;
    strokeWidth: string;
    fill?: string;
  };
  innerRing: {
    d: string;
    fill: string;
    stroke: string;
  };
  logo: {
    d: string;
    fill: string;
  };
  spAttrs: BaseSpAttrType[];
};

const COLOR_MAP = {
  skills: '#FF6142',
  traits: '#007BDF',
  mindsets: '#8F48F1',
  moods: '#8F48F1',
};

const TEXT_WRAP_LIMIT = 10; // # of chars over which we try to wrap
const TEXT_WRAP_LINE_SPACING = 1.2; // ems, basically

export const calculateTextProps = (
  title: string,
  node: NodeType,
  xCenter: number,
  yCenter: number,
  radius: number,
  textSize: number
) => {
  /**
   * Positions and rotates text labels relative to the nodes theyre labelling,
   *  breaking long labels with whitespace into 2 lines if possible
   */

  const xOffsetValue: number = Number(node.cx) - xCenter;
  const yOffsetValue: number = Number(node.cy) - yCenter;
  const transform =
    `translate(${node.cx} ${node.cy})` +
    `rotate(${
      ((xOffsetValue > 0 ? 1 : -1) * Math.asin(yOffsetValue / radius) * 180) /
      Math.PI
    })`;
  const anchor = xOffsetValue > 0 ? 'start' : 'end';
  const xOffset = (xOffsetValue > 0 ? 1 : -1) * 15;

  // this will be the only tspan if we have a short title
  let tspans = [
    {
      anchor,
      title,
      x: xOffset,
      y: textSize / 2,
    },
  ];

  // try to split up long names into two lines in a simplistic way:
  //  - split into whitespace
  //  - concatenate the chunks until the next chunk would make you exceed
  //    the preferred wrap length; the remaining chunks are line two
  // this isn't exactly pro-level typesetting, but it does do better than the
  //  more naive "always split on whitespace" method

  
  if (title.length > TEXT_WRAP_LIMIT && title.indexOf(' ') !== -1) {
    const wsChunks = title.split(' ');
    let firstLine = wsChunks.shift();
    while (firstLine.length + wsChunks[0]?.length <= TEXT_WRAP_LIMIT) {
      firstLine += `${wsChunks.shift()} `;
    }
    const secondLine = wsChunks.join(' ');
    tspans = [
      {
        anchor,
        title: firstLine.trim(),
        x: xOffset,
        y: -textSize / 2,
      },
      {
        anchor,
        title: secondLine,
        x: xOffset,
        y: textSize * TEXT_WRAP_LINE_SPACING - textSize / 2,
      },
    ];
  }

  return { transform, tspans };
};

export const updateWithUserState = (
  userState: UserGoalsType,
  baseState: SkillprintStateType,
  position: Position,
  theme: Theme,
  hasScoreBySkill: { [key: string]: boolean },
  hasScoreByMood: { [key: string]: boolean }
): SkillprintStateType => {
  const { outerRing, innerRing, logo, spAttrs } = baseState;
  const baseSpAttrs: typeof spAttrs = [];
  const userSpConfig = {
    outerRing,
    innerRing,
    logo,
    spAttrs: baseSpAttrs,
  };

  const skillsTexts = userState && userState[0] && userState[0].text && userState[0].text.tspans.length && userState[0].text.tspans.map((tspan) => tspan.title);
  const baseAttr = baseState.spAttrs.find((attr) => attr.group === 'skills');

  let results : any[] = [];

  skillsTexts.length && skillsTexts.forEach((text, index) => {
    if(index > baseState.spAttrs.length - 1) {
      return;
    }

    const result = {
      ...baseState.spAttrs[index]
    }

    result.id = index;
    result.slug = text;

    const group = "skills";

    const userHasSeen = false;
    const name = text

    result.text.size = position.textSize || 12;
    const { transform, tspans } = calculateTextProps(
      text,
      result.node,
      Number(outerRing.cx),
      Number(outerRing.cy),
      Number(outerRing.r),
      Number(result.text.size)
    );
    result.text.transform = transform;
    result.text.tspans = [...tspans];

    console.log(tspans, transform);

    if (hasScoreBySkill[name]) {
      result.node.fill = COLOR_MAP[group];
      result.path.stroke = COLOR_MAP[group];
      result.text.fill = '#00040F';
    } else {
      result.node.fill = theme.colors.grey[300];
      result.path.stroke = theme.colors.grey[300];
      result.text.fill = theme.colors.grey[800];
    }
    if (position.state !== 'reset' && baseAttr.group !== position.state) {
      result.node.fill = 'transparent';
      result.path.stroke = 'transparent';
      result.text.fill = 'transparent';
    }
    
    results.push(result);
  });

  userSpConfig.spAttrs = results;

  return userSpConfig;
};

export default updateWithUserState;
