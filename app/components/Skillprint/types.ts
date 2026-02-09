
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
    anchor: 'start' | 'middle' | 'end' | 'inherit';
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
