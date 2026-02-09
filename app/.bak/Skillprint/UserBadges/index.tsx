import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  useWindowDimensions,
  InteractionManager,
  ListRenderItemInfo,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import { withTheme } from 'styled-components';

import { sortBy } from 'lodash';
import { Label3, Loader, SubHeader4 } from '../../../native-elements';
import Actions from '../../../store/Actions';
import Selectors from '../../../store/Selectors';
import { BadgeDetails, ErrorScreen } from '../../../components';
import { amplitudeEvents, logAmplitudeEvent } from '../../../analytics';
import { refreshPage } from '../../../Utils/Navigation';

import type { Theme } from '../../../native-elements';
import BadgeTile from './BadgeTile';

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

const HeaderHolder = styled.View<StyledProps>`
  padding: ${({ theme }) => theme.spacing.M}px;
  justify-content: space-between;
  flex-direction: row;
`;

const ListHolder = styled.FlatList<StyledProps>``;

const TileHolder = styled.TouchableOpacity<StyledProps>`
  flex: 1;
  align-items: center;
`;

type Props = {
  theme: Theme;
};

const UserBadges: React.FC<Props> = ({ theme }) => {
  const [achievement, setAchievement] = useState<UserAchievementType>(null);
  const dispatch = useDispatch();
  const { width, height } = useWindowDimensions();

  const {
    data,
    loading,
    error,
  }: {
    data: UserAchievementType[];
    loading: boolean;
    error: typeof Error;
  } = useSelector(Selectors.user.selectUserAchievements);

  useFocusEffect(
    useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        dispatch(Actions.user.getUserAchievements());
        logAmplitudeEvent({
          event: amplitudeEvents.trophyCaseViewed,
          properties: {},
        });
      });
    }, [])
  );

  useEffect(() => {
    if (achievement) {
      logAmplitudeEvent({
        event: amplitudeEvents.achievementBadgeViewed,
        properties: {
          slug: achievement.slug,
          name: achievement.name,
          pageContext: 'Skillprint tab',
        },
      });
    }
  }, [achievement]);

  if (error) {
    return (
      <ErrorScreen
        theme={theme}
        primaryButtonText="Refresh"
        onPressPrimary={refreshPage}
        message="Failed to load user achievements"
        error={error}
      />
    );
  }

  if (!data || loading) {
    return <Loader />;
  }

  const sortedData = sortBy(data, (d) => !!d.userAchievementId).reverse();
  const badgeCount = (data.filter((f) => !!f.userAchievementId) || []).length;

  return (
    <ScrollContainer theme={theme}>
      <Container theme={theme} width={width} height={height}>
        <HeaderHolder theme={theme}>
          <SubHeader4>Number of Badges</SubHeader4>
          <Label3>{badgeCount}</Label3>
        </HeaderHolder>
        <ListHolder
          theme={theme}
          keyExtractor={(item: UserAchievementType) => item.slug}
          contentContainerStyle={{
            padding: 8,
          }}
          scrollEnabled={false}
          numColumns={3}
          data={sortedData}
          renderItem={({ item }: ListRenderItemInfo<UserAchievementType>) => {
            return (
              <TileHolder onPress={() => setAchievement(item)}>
                <BadgeTile achievement={item} />
              </TileHolder>
            );
          }}
        />
        <BadgeDetails
          achievement={achievement}
          setShowBadgeDetails={(state) => {
            if (state === false) {
              setAchievement(null);
            }
          }}
          showBadgeDetails={!!achievement}
        />
      </Container>
    </ScrollContainer>
  );
};

export default withTheme(UserBadges);
