'use client';

import { useState, useEffect, useRef } from 'react';
import BottomTabs from '../components/BottomTabs';

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
  const svgRef = useRef<SVGSVGElement>(null);

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
      </div>
      <BottomTabs />
    </div>
  );
} 