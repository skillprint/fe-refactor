import * as React from 'react';
import styled from 'styled-components/native';
import { withTheme } from 'styled-components';

import { Body3, Image, Label4, Theme } from '../../../native-elements';
import LocalImageAssets from '../../../assets/images';

type BadgeTileProps = {
  achievement: UserAchievementType;
  theme: Theme;
};

type StyledProps = {
  theme: Theme;
};

const Container = styled.View<StyledProps>`
  align-items: center;
  padding: ${({ theme }) => theme.spacing.XS}px;
  text-align: center;
  word-wrap: break-word;
`;

const BadgeTile: React.FC<BadgeTileProps> = ({ theme, achievement }) => {
  const { name, slug, userAchievementId, triggerTargetAttribute } = achievement;
  const uri =
    LocalImageAssets.badges.icons[`${slug}${userAchievementId ? '' : '-grey'}`];

  return (
    <Container theme={theme}>
      <Image source={{ uri }} width={80} height={80} />
      {!!triggerTargetAttribute && (
        <Body3 color={theme.colors.grey[600]}>
          {triggerTargetAttribute?.name}
        </Body3>
      )}
      <Label4>{name}</Label4>
    </Container>
  );
};

export default withTheme(BadgeTile);
