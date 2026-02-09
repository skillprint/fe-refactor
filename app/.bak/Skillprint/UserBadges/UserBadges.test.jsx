import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import * as UtilsApi from '../../../../Utils/Api';
import * as analytics from '../../../../analytics';
import Api from '../../../../Utils/Api';
import { renderWithContext } from '../../../../Utils/testUtils';
import userAchievements from '../../../../../__fixtures__/userAchievements';

import UserBadges from '.';

jest.mock('../../../../Utils/Api');

analytics.logAmplitudeEvent = jest.fn();

const dataMap = {
  'v2/goals/user-achievements/': userAchievements,
};

describe('Game Result', () => {
  beforeEach(() => {
    const apiMock = (url) => (resolve) => {
      setTimeout(() => {
        if (dataMap[url]) {
          return resolve({ data: dataMap[url] });
        }
        throw new Error(`Url mock missing for: ${url}`);
      }, 100);
    };

    Api.get.mockImplementation((url) => {
      return new Promise(apiMock(url));
    });

    UtilsApi.getHandler.mockImplementation((___, url) => {
      return new Promise(apiMock(url));
    });

    analytics.logAmplitudeEvent.mockReset();
  });

  it('should render the trophy case', async () => {
    const wrapper = renderWithContext(<UserBadges />);
    // See the loader first
    expect(wrapper.getAllByRole('progressbar').length).toBe(1);
    await waitFor(async () => {
      expect(wrapper.getByText('Visualization')).toBeInTheDocument();
      const button = wrapper.getByText('Worldly Whale');
      await act(async () => {
        fireEvent.click(button);
      });
    });

    await waitFor(() => {
      expect(wrapper.getByText('Skill associated with')).toBeInTheDocument();
    });
  });

  it('should log to amplitude for viewing trophy case', async () => {
    const wrapper = renderWithContext(<UserBadges />);
    await waitFor(async () => {
      expect(analytics.logAmplitudeEvent).toHaveBeenCalledWith({
        event: analytics.amplitudeEvents.trophyCaseViewed,
        properties: {},
      });
      const button = wrapper.getByText('Worldly Whale');
      await act(async () => {
        fireEvent.click(button);
      });
    });
  });

  it('should log to amplitude for viewing specific badges', async () => {
    const wrapper = renderWithContext(<UserBadges />);
    await waitFor(async () => {
      const button = wrapper.getByText('Worldly Whale');
      await act(async () => {
        fireEvent.click(button);
      });
    });

    await waitFor(() => {
      expect(analytics.logAmplitudeEvent).toHaveBeenCalledWith({
        event: analytics.amplitudeEvents.achievementBadgeViewed,
        properties: {
          slug: 'worldly-whale',
          name: 'Worldly Whale',
          pageContext: 'Skillprint tab',
        },
      });
    });
  });
});
