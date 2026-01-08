'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '../components/TopNav';
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
  const router = useRouter();
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

  const handleSkillClick = (skillName: string) => {
    // Navigate to skill detail page with the skill name as a parameter
    router.push(`/profile/skill/${encodeURIComponent(skillName)}`);
  };

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

    const nodes: {
      group: SVGGElement;
      circle: SVGCircleElement;
      text: SVGTextElement;
      levelText: SVGTextElement;
      line: SVGLineElement;
      baseX: number;
      baseY: number;
      phase: number;
      speed: number;
    }[] = [];

    // Create skill nodes
    skills.forEach((skill, index) => {
      const angle = (index * 2 * Math.PI) / skills.length;
      const x = centerX + (radius * 0.7) * Math.cos(angle);
      const y = centerY + (radius * 0.7) * Math.sin(angle);

      // Create a group for the skill node to make it clickable
      const skillGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      skillGroup.setAttribute('cursor', 'pointer');
      skillGroup.addEventListener('click', () => handleSkillClick(skill.name));

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

      // Create skill circle
      const skillCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      skillCircle.setAttribute('cx', x.toString());
      skillCircle.setAttribute('cy', y.toString());
      skillCircle.setAttribute('r', "40");
      skillCircle.setAttribute('fill', skill.color);
      skillCircle.setAttribute('stroke', '#FFFFFF');
      skillCircle.setAttribute('stroke-width', '3');
      skillCircle.setAttribute('opacity', '0.8');
      skillGroup.appendChild(skillCircle);

      // Add hover effects
      skillGroup.addEventListener('mouseenter', () => {
        skillCircle.setAttribute('opacity', '1');
      });
      skillGroup.addEventListener('mouseleave', () => {
        skillCircle.setAttribute('opacity', '0.8');
      });

      // Create skill text
      const skillText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      skillText.setAttribute('x', x.toString());
      skillText.setAttribute('y', (y - 55).toString());
      skillText.setAttribute('text-anchor', 'middle');
      skillText.setAttribute('fill', '#000');
      skillText.setAttribute('font-size', '18');
      skillText.setAttribute('font-weight', 'bold');
      skillText.textContent = skill.name;
      skillGroup.appendChild(skillText);

      // Create level text
      const levelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      levelText.setAttribute('x', x.toString());
      levelText.setAttribute('y', (y + 5).toString());
      levelText.setAttribute('text-anchor', 'middle');
      levelText.setAttribute('fill', '#000');
      levelText.setAttribute('font-size', '14');
      levelText.textContent = `${skill.level}%`;
      skillGroup.appendChild(levelText);

      // Append the skill group after the line so it appears on top
      svg.appendChild(skillGroup);

      nodes.push({
        group: skillGroup,
        circle: skillCircle,
        text: skillText,
        levelText: levelText,
        line: line,
        baseX: x,
        baseY: y,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5 // Random speed between 0.5 and 1.0
      });
    });

    // Animation loop
    let animationId: number;
    const animate = () => {
      const time = Date.now() / 1000;

      nodes.forEach(node => {
        // Create a gentle floating motion
        const offsetX = Math.sin(time * node.speed + node.phase) * 3;
        const offsetY = Math.cos(time * node.speed * 0.8 + node.phase) * 3;

        const newX = node.baseX + offsetX;
        const newY = node.baseY + offsetY;

        // Update positions
        node.circle.setAttribute('cx', newX.toString());
        node.circle.setAttribute('cy', newY.toString());

        node.text.setAttribute('x', newX.toString());
        node.text.setAttribute('y', (newY - 55).toString());

        node.levelText.setAttribute('x', newX.toString());
        node.levelText.setAttribute('y', (newY + 5).toString());

        node.line.setAttribute('x2', newX.toString());
        node.line.setAttribute('y2', newY.toString());
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  };

  useEffect(() => {
    const cleanup = renderRadialCluster();
    return () => {
      if (cleanup) cleanup();
    };
  }, [skills]);

  return (
    <div className="font-sans min-h-screen bg-background">
      <TopNav />
      <div className="p-8 pb-32">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Your Skillprint
        </h1>

        <div className="bg-card rounded-lg shadow">
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
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Skill Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => handleSkillClick(skill.name)}
                className="flex items-center justify-between p-3 bg-card rounded-lg cursor-pointer hover:bg-secondary transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                  <span className="text-foreground font-medium">
                    {skill.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${skill.level}%`,
                        backgroundColor: skill.color,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {skill.level}%
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Achievements
            </h2>
            <button
              onClick={() => router.push('/badges')}
              className="text-sm text-primary font-medium hover:underline"
            >
              View All
            </button>
          </div>

          <div
            onClick={() => router.push('/badges')}
            className="bg-card rounded-lg shadow p-4 cursor-pointer hover:bg-secondary transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-10 w-10 rounded-full ring-2 ring-card bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg">🏆</div>
                <div className="inline-block h-10 w-10 rounded-full ring-2 ring-card bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-lg">🧠</div>
                <div className="inline-block h-10 w-10 rounded-full ring-2 ring-card bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-lg">⚡</div>
              </div>
              <div className="flex-1">
                <p className="text-foreground font-medium">4 Badges Earned</p>
                <p className="text-sm text-muted-foreground">Latest: Consistent</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Settings
          </h2>
          <div className="bg-card rounded-lg shadow p-6 space-y-6">
            {/* API Configuration */}
            <div className="space-y-4 border-b border-border pb-6">
              <h3 className="text-lg font-medium text-foreground">
                API Configuration
              </h3>
              <div className="grid gap-4">
                <div>
                  <label htmlFor="user_id" className="block text-sm font-medium text-muted-foreground mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    id="user_id"
                    value={userId}
                    onChange={(e) => updateSetting('user_id', e.target.value, setUserId)}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter User ID"
                  />
                </div>
                <div>
                  <label htmlFor="api_key" className="block text-sm font-medium text-muted-foreground mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    id="api_key"
                    value={apiKey}
                    onChange={(e) => updateSetting('api_key', e.target.value, setApiKey)}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter API Key"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  Reset First-Time Experience
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
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
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105">
                Reset
              </button>
            </div>

            {/* Temp Toast Test */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  Test Notification
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Trigger a test toast notification
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}