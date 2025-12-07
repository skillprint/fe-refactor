'use client';

import { useState, useEffect, useRef } from 'react';
import BottomTabs from '../components/BottomTabs';
import toast from 'react-hot-toast';

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  color: string;
}

const sampleSkills: Skill[] = [
  { id: '1', name: 'Problem Solving', level: 85, category: 'Cognitive', color: '#3B82F6' },
  { id: '2', name: 'Memory', level: 78, category: 'Cognitive', color: '#10B981' },
  { id: '3', name: 'Speed', level: 92, category: 'Cognitive', color: '#F59E0B' },
  { id: '4', name: 'Accuracy', level: 88, category: 'Cognitive', color: '#EF4444' },
  { id: '5', name: 'Pattern Recognition', level: 76, category: 'Cognitive', color: '#8B5CF6' },
  { id: '6', name: 'Spatial Awareness', level: 82, category: 'Cognitive', color: '#06B6D4' },
  { id: '7', name: 'Logic', level: 89, category: 'Cognitive', color: '#84CC16' },
  { id: '8', name: 'Creativity', level: 71, category: 'Cognitive', color: '#F97316' },
];

export default function Skillprint() {
  const [skills, setSkills] = useState<Skill[]>(sampleSkills);
  const [userId, setUserId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Load settings from cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };
    setUserId(getCookie('user_id') || '');
    setApiKey(getCookie('api_key') || '');
  }, []);

  const updateSetting = (name: string, value: string, setter: (val: string) => void) => {
    setter(value);
    // Set cookie with 1 year expiration
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
  };

  const renderRadialCluster = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const width = 600;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 300;

    // Clear previous content
    svg.innerHTML = '';

    // Create background circle
    // const backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    // backgroundCircle.setAttribute('cx', centerX.toString());
    // backgroundCircle.setAttribute('cy', centerY.toString());
    // backgroundCircle.setAttribute('r', radius.toString());
    // backgroundCircle.setAttribute('fill', '#F3F4F6');
    // backgroundCircle.setAttribute('stroke', '#E5E7EB');
    // backgroundCircle.setAttribute('stroke-width', '2');
    // svg.appendChild(backgroundCircle);

    // Create skill nodes
    skills.forEach((skill, index) => {
      const angle = (index * 2 * Math.PI) / skills.length;
      const x = centerX + (radius * 0.7) * Math.cos(angle);
      const y = centerY + (radius * 0.7) * Math.sin(angle);

      // Create skill circle
      const skillCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      skillCircle.setAttribute('cx', x.toString());
      skillCircle.setAttribute('cy', y.toString());
      skillCircle.setAttribute('r', "40");
      skillCircle.setAttribute('fill', skill.color);
      skillCircle.setAttribute('stroke', '#FFFFFF');
      skillCircle.setAttribute('stroke-width', '3');
      skillCircle.setAttribute('opacity', '0.8');
      svg.appendChild(skillCircle);

      // Create skill text
      const skillText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      skillText.setAttribute('x', x.toString());
      skillText.setAttribute('y', (y - 55).toString());
      skillText.setAttribute('text-anchor', 'middle');
      skillText.setAttribute('fill', '#000');
      skillText.setAttribute('font-size', '18');
      skillText.setAttribute('font-weight', 'bold');
      skillText.textContent = skill.name;
      svg.appendChild(skillText);

      // Create level text
      const levelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      levelText.setAttribute('x', x.toString());
      levelText.setAttribute('y', (y + 5).toString());
      levelText.setAttribute('text-anchor', 'middle');
      levelText.setAttribute('fill', '#000');
      levelText.setAttribute('font-size', '14');
      levelText.textContent = `${skill.level}%`;
      svg.appendChild(levelText);

      // Create connecting line to center
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', centerX.toString());
      line.setAttribute('y1', centerY.toString());
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#777777');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.5');
      svg.appendChild(line);
    });
  };

  useEffect(() => {
    renderRadialCluster();
  }, [skills]);

  return (
    <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 pb-32">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Your Skillprint
        </h1>

        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-center">
            <svg
              ref={svgRef}
              width="600"
              height="600"
              viewBox="0 0 600 600"
              className="max-w-full h-auto"
            />
          </div>
        </div>

        <div className="py-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Skill Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {skill.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${skill.level}%`,
                        backgroundColor: skill.color,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 w-12 text-right">
                    {skill.level}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Settings
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            {/* API Configuration */}
            <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                API Configuration
              </h3>
              <div className="grid gap-4">
                <div>
                  <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    id="user_id"
                    value={userId}
                    onChange={(e) => updateSetting('user_id', e.target.value, setUserId)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter User ID"
                  />
                </div>
                <div>
                  <label htmlFor="api_key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    id="api_key"
                    value={apiKey}
                    onChange={(e) => updateSetting('api_key', e.target.value, setApiKey)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter API Key"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Reset First-Time Experience
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Clear all first-time user experience flags to see the welcome carousel again
                </p>
              </div>
              <button
                onClick={() => {
                  // Delete the FTUE cookie
                  document.cookie = 'ftue_completed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

                  // Show confirmation
                  toast.success('Settings reset! Refresh the page to see the welcome experience again.');
                }}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105">
                Reset
              </button>
            </div>

            {/* Temp Toast Test */}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Test Notification
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Trigger a test toast notification
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomTabs />
    </div>
  );
}