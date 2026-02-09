import * as React from 'react';
import Svg, { G, Circle, Text, TSpan, Path } from 'react-native-svg';
import type { TextAnchor } from 'react-native-svg';
import { SkillprintStateType } from './summaryUtils';


export const SVG_COLOR_MAP = {
  skills: '#FF6142',
  traits: '#007BDF',
  mindsets: '#8F48F1',
  textFill: '#00040F',
};

type Props = {
  data: SkillprintStateType;
  size: number;
  state: string;
  viewBox?: string;
};

const SkillprintSvg: React.FC<Props> = ({ data, size, state, viewBox }) => {

  console.log(data);

  return (
  <Svg width={size} height={size} viewBox={viewBox} fill="none">
    {/* tempting to just spread outerRing and let the SVG be in charge */}
    <Circle
      cx={data.outerRing.cx}
      cy={data.outerRing.cy}
      r={data.outerRing.r}
      fill={data.outerRing.fill}
      stroke={data.outerRing.stroke}
      strokeWidth={data.outerRing.strokeWidth}
    />
    {data.spAttrs.map((ss) => (
      <G key={ss.id}>
        <Path
          d={ss.path.d}
          stroke={ss.path.stroke}
          strokeWidth={ss.path.strokeWidth}
        />
        <Circle
          cx={ss.node.cx}
          cy={ss.node.cy}
          r={ss.node.r}
          fill={ss.node.fill}
        />
        {state !== 'reset' && (
          <Text
            transform={ss.text.transform}
            fill={ss.text.fill}
            // xmlSpace="preserve"
            // style={{
            //   whiteSpace: 'pre',
            // }}
            fontFamily="Inter-SemiBold"
            fontSize={ss.text.size || 12}
            fontWeight={600}
            letterSpacing="0em"
          >
            {ss.text.tspans.length && ss.text.tspans.map((tspan) => {
              console.log(tspan);
              return (
              <TSpan
                y={tspan.y}
                x={tspan.x}
                textAnchor={tspan.anchor as TextAnchor}
                key={`${tspan.x} ${tspan.y}`}
              >
                {tspan.title}
              </TSpan>
              )
            })}
          </Text>
        )}
      </G>
    ))}
    {/* same as above, tempting to just spread the objs */}
    <Path
      d={data.innerRing.d}
      fill={data.innerRing.fill}
      stroke={data.innerRing.stroke}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d={data.logo.d}
      fill={data.logo.fill}
    />
  </Svg>
  );
}

SkillprintSvg.defaultProps = {
  viewBox: '0 0 812 812',
};

export default SkillprintSvg;
