import * as React from 'react';
import styled from 'styled-components/native';

import { withTheme } from 'styled-components';
import { Label4 } from '../../../native-elements';
import {
  MindsetList,
  SkillList,
  TraitList,
  UserStats,
} from '../../../../components';

import type { Theme } from '../../../native-elements';
import type { SkillprintTabStates, Position } from './summaryUtils';

type StyledProps = {
  theme: Theme;
  show?: boolean;
  selected?: boolean;
  noPadding?: boolean;
};

type Props = {
  theme: Theme;
  setSvg: (state: SkillprintTabStates) => void;
  position: Position;
};

const TabContainer = styled.View<StyledProps>`
  z-index: 5;
  background-color: ${({ theme }) => theme.colors.grey[0]};
`;

const TabBarContainer = styled.View<StyledProps>`
  flex-direction: row;
  border-radius: ${({ theme }) => theme.spacing.XXS}px;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.grey[300]};
  padding: ${({ theme }) => theme.spacing.XS}px;
  overflow-x: auto;
  scrollbar-width: none;
`;

const TabButton = styled.TouchableOpacity<StyledProps>`
  padding-horizontal: ${({ theme }) => theme.spacing.M}px;
  padding-vertical: ${({ theme }) => theme.spacing.S}px;
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.grey[0] : 'transparent'};
  border-radius: ${({ theme }) => theme.spacing.S}px;
`;

const ContentContainer = styled.View<StyledProps>`
  display: ${({ show }) => (show ? 'block' : 'none')};
  padding-horizontal: ${({ noPadding, theme }) =>
    noPadding ? 0 : theme.spacing.M}px;
  background-color: ${({ theme }) => theme.colors.grey[0]};
`;

const SkillprintTabs: React.FC<Props> = ({ theme, position, setSvg }) => {
  return (
    <TabContainer theme={theme}>
      <TabBarContainer theme={theme}>
        <TabButton
          theme={theme}
          onPress={() => setSvg('reset')}
          selected={position.state === 'reset'}
        >
          <Label4 color={theme.colors.grey[500]}>SUMMARY</Label4>
        </TabButton>
        <TabButton
          theme={theme}
          onPress={() => setSvg('mindsets')}
          selected={position.state === 'mindsets'}
        >
          <Label4 color={theme.colors.grey[500]}>MOODS</Label4>
        </TabButton>
        <TabButton
          theme={theme}
          onPress={() => setSvg('skills')}
          selected={position.state === 'skills'}
        >
          <Label4 color={theme.colors.grey[500]}>SKILLS</Label4>
        </TabButton>
        <TabButton
          theme={theme}
          onPress={() => setSvg('traits')}
          selected={position.state === 'traits'}
        >
          <Label4 color={theme.colors.grey[500]}>PERSONALITY</Label4>
        </TabButton>
      </TabBarContainer>
      <ContentContainer show={position.state === 'mindsets'} theme={theme}>
        <MindsetList />
      </ContentContainer>
      <ContentContainer show={position.state === 'skills'} theme={theme}>
        <SkillList />
      </ContentContainer>
      <ContentContainer show={position.state === 'traits'} theme={theme}>
        <TraitList />
      </ContentContainer>
      <ContentContainer
        show={position.state === 'reset'}
        noPadding
        theme={theme}
      >
        <UserStats />
      </ContentContainer>
    </TabContainer>
  );
};

export default withTheme(SkillprintTabs);
