import React from 'react';
import { waitFor } from '@testing-library/react';

import * as UtilsApi from '../../../../Utils/Api';
import Api from '../../../../Utils/Api';
import { renderWithContext } from '../../../../Utils/testUtils';
import skillAttributeMock from '../../../../../__fixtures__/skill';
import mindsetAttributeMock from '../../../../../__fixtures__/mindset';
import profileData from '../../../../../__fixtures__/profile';
import allGoals from '../../../../../__fixtures__/allGoals';

import SkillprintSummary from '.';

jest.mock('../../../../Utils/Api');

const dataMap = {
  'v2/auth/profile/': profileData,
  'v2/activities/featured/?n=all': [skillAttributeMock, mindsetAttributeMock],
  'v2/goals/': allGoals,
  'v2/activities/recommended/': skillAttributeMock,
};

describe('Game Result', () => {
  beforeEach(() => {
    const apiMock = (url) => (resolve) => {
      setTimeout(() => {
        if (dataMap[url]) {
          return resolve({ data: dataMap[url] });
        }
        throw new Error(`Url mock missing for: ${  url}`);
      }, 100);
    };

    Api.get.mockImplementation((url) => {
      return new Promise(apiMock(url));
    });

    UtilsApi.getHandler.mockImplementation((___, url) => {
      return new Promise(apiMock(url));
    });
  });
  it('should render the default summary page', async () => {
    const wrapper = renderWithContext(
      <SkillprintSummary route={{ params: 'reset' }} />
    );
    // See the loader first
    expect(wrapper.getAllByRole('progressbar').length).toBe(1);
    await waitFor(() => {
      expect(wrapper.getByText('SUMMARY')).toBeInTheDocument();
    });
  });
  // [TODO][TESTS]:
  // Add tests testing the pressing of the buttons and moving of the svg
  // Add tests rendering the different list and personality
});
