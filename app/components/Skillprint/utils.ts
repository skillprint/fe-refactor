
import { BaseSpAttrType, NodeType, Position, SkillprintStateType, TspanType } from './types';

const TEXT_WRAP_LIMIT = 10;
const TEXT_WRAP_LINE_SPACING = 1.2;

export const COLOR_MAP: Record<string, string> = {
    skills: '#FF6142',
    traits: '#007BDF',
    mindsets: '#8F48F1',
    moods: '#8F48F1',
    textFill: '#00040F',
};

export const calculateTextProps = (
    title: string,
    node: NodeType,
    xCenter: number,
    yCenter: number,
    radius: number,
    textSize: number
) => {
    const xOffsetValue: number = Number(node.cx) - xCenter;
    const yOffsetValue: number = Number(node.cy) - yCenter;
    const transform =
        `translate(${node.cx} ${node.cy})` +
        `rotate(${((xOffsetValue > 0 ? 1 : -1) * Math.asin(yOffsetValue / radius) * 180) /
        Math.PI
        })`;
    const anchor: TspanType['anchor'] = xOffsetValue > 0 ? 'start' : 'end';
    const xOffset = (xOffsetValue > 0 ? 1 : -1) * 15;

    let tspans: TspanType[] = [
        {
            anchor,
            title,
            x: xOffset,
            y: textSize / 2,
        },
    ];

    if (title.length > TEXT_WRAP_LIMIT && title.indexOf(' ') !== -1) {
        const wsChunks = title.split(' ');
        let firstLine = wsChunks.shift() || '';
        while (wsChunks.length > 0 && firstLine.length + (wsChunks[0]?.length || 0) <= TEXT_WRAP_LIMIT) {
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
    userSkills: string[], // List of skill names
    userMoods: string[], // List of mood names
    baseState: SkillprintStateType,
    position: Position,
    hasScoreBySkill: { [key: string]: boolean },
    hasScoreByMood: { [key: string]: boolean },
    themeColors: { grey300: string; grey800: string }
): SkillprintStateType => {
    const { outerRing, innerRing, logo, spAttrs } = baseState;

    // We will map userSkills to 'skills' group nodes
    // and userMoods to 'mindsets' group nodes.
    // 'traits' seem unused in the current profile view based on the request, but we can leave them formatted if needed.

    const resultSpAttrs: BaseSpAttrType[] = spAttrs.map((attr) => {
        let newItem = { ...attr };
        let userText = '';
        let hasScore = false;

        if (attr.group === 'skills') {
            // Find corresponding skill based on index within the group?
            // spAttrs has fixed nodes. We should probably fill them in order.
            // But the original code was mapping by index.
            // Let's find the index of this attr within the 'skills' group
            const skillNodes = spAttrs.filter(a => a.group === 'skills');
            const indexInGroup = skillNodes.findIndex(a => a.id === attr.id);

            if (indexInGroup !== -1 && indexInGroup < userSkills.length) {
                userText = userSkills[indexInGroup];
                hasScore = hasScoreBySkill[userText] || false; // Or simply true if checking existence? 
            }
        } else if (attr.group === 'mindsets') {
            const moodNodes = spAttrs.filter(a => a.group === 'mindsets');
            const indexInGroup = moodNodes.findIndex(a => a.id === attr.id);

            if (indexInGroup !== -1 && indexInGroup < userMoods.length) {
                userText = userMoods[indexInGroup];
                hasScore = hasScoreByMood[userText] || false;
            }
        } else if (attr.group === 'traits') {
            // Traits logic if needed
        }

        if (userText) {
            newItem.slug = userText;
            newItem.text = { ...newItem.text, size: position.textSize || 12 };

            const { transform, tspans } = calculateTextProps(
                userText,
                newItem.node,
                Number(outerRing.cx),
                Number(outerRing.cy),
                Number(outerRing.r),
                Number(newItem.text.size)
            );

            newItem.text.transform = transform;
            newItem.text.tspans = tspans;

            if (hasScore) {
                newItem.node.fill = COLOR_MAP[attr.group] || COLOR_MAP.skills;
                newItem.path.stroke = COLOR_MAP[attr.group] || COLOR_MAP.skills;
                newItem.text.fill = COLOR_MAP.textFill;
            } else {
                newItem.node.fill = themeColors.grey300;
                newItem.path.stroke = themeColors.grey300;
                newItem.text.fill = themeColors.grey800;
            }
        } else {
            // No user text for this node, maybe hide it or render empty?
            // Original code seems to rely on array length.
            // If we don't have text, maybe we shouldn't render the text, but keep the node?
            // Or hide it completely if it's dynamic.
            // The original code pushed to results only if user text existed.
            // Let's mark it as hidden/transparent for now if no text.
            newItem.node.fill = 'transparent';
            newItem.path.stroke = 'transparent';
            newItem.text.fill = 'transparent';
        }

        // Zoom/Focus logic
        if (position.state !== 'reset' && attr.group !== position.state) {
            newItem.node.fill = 'transparent';
            newItem.path.stroke = 'transparent';
            newItem.text.fill = 'transparent';
        }

        return newItem;
    });

    return {
        ...baseState,
        spAttrs: resultSpAttrs
    };
};
