import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Me from './Summary';
// import Badges from './UserBadges';

const Skillprint = ({ uniqueMoodKeys, uniqueSkillKeys, hasScoreByMood, hasScoreBySkill } : { 
  uniqueMoodKeys: string[], uniqueSkillKeys: string[], 
  hasScoreByMood: { [key: string]: boolean }, hasScoreBySkill: { [key: string]: boolean }
}) => {
  return (
    <Me 
    theme={null}
    moods={uniqueMoodKeys}
    skills={uniqueSkillKeys}
    hasScoreByMood={hasScoreByMood}
    hasScoreBySkill={hasScoreBySkill}
    ></Me>
  );
};

export default Skillprint;
