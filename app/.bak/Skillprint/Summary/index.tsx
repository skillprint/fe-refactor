import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useWindowDimensions, InteractionManager } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import { withTheme } from 'styled-components';

import { flatten, has } from 'lodash';
import { Loader } from '../../../native-elements';
import skillprintStruct from './spBaseState';
import Actions from '../../../store/Actions';
import Selectors from '../../../store/Selectors';
import {
  AttributeTileWithContainer,
  ErrorScreen,
} from '../../../components';
import { amplitudeEvents, logAmplitudeEvent } from '../../../analytics';
import SkillprintTabs from './SkillprintTabs';
import { refreshPage } from '../../../Utils/Navigation';
import SkillprintSvg from './SkillprintSvg';
import { updateWithUserState } from './summaryUtils';
import { View } from 'react-native';

import type { Theme } from '../../../native-elements';

type StyledProps = {
  height?: number;
  width?: number;
  theme: Theme;
};

const ScrollContainer = styled.ScrollView<StyledProps>``;

const Container = styled.View<StyledProps>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;

const GraphContainerWrapper = styled.View<StyledProps>`
  align-items: center;
  justify-content: center;
  height: ${({ height }) => height}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.grey[0]};
`;

const GraphContainer = styled.View<StyledProps>`
  align-items: center;
  justify-content: center;
`;

const RecommendedActivityRow = styled.View<StyledProps>`
  padding: ${({ theme }) => theme.spacing.XS}px;
  background-color: ${({ theme }) => theme.colors.grey[0]};
`;

type Props = {
  moods: string[];
  skills: string[];
  hasScoreByMood: { [key: string]: boolean };
  hasScoreBySkill: { [key: string]: boolean };
  theme: Theme;
};

const SkillprintScreen: React.FC<Props> = ({ moods, skills, theme, hasScoreByMood, hasScoreBySkill }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const [zoomChanged, setZoomChanged] = useState(false);
  const prevState = useRef(null);
  const skillprintHolderHeight = height - 400;

  const zooms = {
    skills: {
      state: 'skills',
      translate: { dx: 0, dy: 0 },
      scale: 1.6,
      rotate: '0deg',
      textSize: 13,
    },
    moods: {
      state: 'mindsets',
      translate: { dx: 0, dy: 0 },
      scale: 2.0,
      rotate: '0deg',
      textSize: 13,
    }
  };

  const position = zooms['skills'];
  // const {
  //   data,
  //   loading,
  //   error,
  // }: {
  //   data: UserGoalsType;
  //   loading: boolean;
  //   error: typeof Error;
  // } = useSelector(Selectors.category.selectAllGoals);
  // const user = useSelector(Selectors.auth.selectUser);
  
  // const {
  //   data: recommendedActivity,
  //   loading: recommendedActivityLoading,
  //   error: recommendedActivityError,
  // } = useSelector(Selectors.category.selectRecommendedActivity);

  const setSvg = (key: keyof UserGoalsType) => {
    navigation.setParams({
      state: key,
    });
  };

  const data : AttributeMedium[] = [
    {
      id: 1,
      group: 'skills',
      slug: 'skills',
      text: {
        fill: '#000',
        tspans: skills && skills.map((skill) => (
          {
            anchor: 'middle',
            title: skill,
            x: 0,
            y: 0,
          }
        )) || []
      },
      node: {
        cx: '0',
        cy: '0',
        r: '10',
        fill: '#000',
      },
    },
    {
      id: 2,
      group: 'moods',
      slug: 'moods',
      text: {
        fill: '#000',
        tspans: moods && moods.map((mood) => (
          {
            anchor: 'middle',
            title: mood,
            x: 0,
            y: 0,
          }
        )) || []
      },
      node: {
        cx: '0',
        cy: '0',
        r: '10',
        fill: '#000',
      },
    }
  ]

  console.log(data);

  const loading = false;

  if (!data || loading) {
    return <Loader />;
  }

  const spContent = updateWithUserState(
    data,
    skillprintStruct,
    position,
    theme,
    hasScoreBySkill,
    hasScoreByMood
  );

  return (
    <>
        <GraphContainerWrapper theme={theme} height={skillprintHolderHeight}>
          <GraphContainer
            style={{
              transform: [
                { translateX: position.translate.dx },
                { translateY: 0 },
                { scale: position.scale },
                { rotate: position.rotate },
              ],
            }}
          >
            <SkillprintSvg
              data={spContent}
              size={width/2}
              state={position.state}
            />
          </GraphContainer>
        </GraphContainerWrapper>
    </>
  );
};

export default withTheme(SkillprintScreen);
