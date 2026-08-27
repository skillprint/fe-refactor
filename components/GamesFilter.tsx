import React, { useState, useRef, useEffect } from 'react';

export interface SkillOption {
  slug: string;
  name: string;
  pillar: 'mood' | 'cognition' | 'personality';
}

export interface GamesFilterProps {
  moods: SkillOption[];
  cognitions: SkillOption[];
  personalities: SkillOption[];
  selectedMood: string | null;
  selectedCognition: string | null;
  selectedPersonality: string | null;
  onSelectMood: (slug: string | null) => void;
  onSelectCognition: (slug: string | null) => void;
  onSelectPersonality: (slug: string | null) => void;
  onClearAll: () => void;
}

export function GamesFilter({
  moods,
  cognitions,
  personalities,
  selectedMood,
  selectedCognition,
  selectedPersonality,
  onSelectMood,
  onSelectCognition,
  onSelectPersonality,
  onClearAll
}: GamesFilterProps) {
  const [openDropdown, setOpenDropdown] = useState<'mood' | 'cognition' | 'personality' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (pillar: 'mood' | 'cognition' | 'personality') => {
    setOpenDropdown(prev => (prev === pillar ? null : pillar));
  };

  const isAllSelected = !selectedMood && !selectedCognition && !selectedPersonality;

  const renderDropdown = (
    pillar: 'mood' | 'cognition' | 'personality',
    label: string,
    allLabel: string,
    iconId: string,
    options: SkillOption[],
    selectedValue: string | null,
    onSelect: (slug: string | null) => void
  ) => {
    const isOpen = openDropdown === pillar;
    const selectedOption = options.find(o => o.slug === selectedValue);
    
    return (
      <div className={`sp-dropdown skill-filter__dim ${selectedValue ? 'is-set' : ''}`} data-pillar={pillar}>
        <button 
          className="button button--secondary button--sm sp-dropdown__trigger" 
          type="button" 
          aria-expanded={isOpen} 
          onClick={() => toggleDropdown(pillar)}
        >
          <span className="sp-dropdown__value">
            <svg className="sp-icon sp-icon--2xs" aria-hidden="true" viewBox="0 0 24 24"><use href={`#${iconId}`}></use></svg>
            <span>{selectedOption ? selectedOption.name : allLabel}</span>
          </span>
          <svg className="sp-icon sp-dropdown__chevron" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-down"></use></svg>
        </button>
        <div className="sp-dropdown__menu skill-filter__menu" role="listbox" aria-label={label} hidden={!isOpen}>
          <button 
            className="button button--tertiary button--sm sp-dropdown__item" 
            type="button" 
            role="option"
            tabIndex={-1}
            aria-selected={!selectedValue}
            onClick={() => { onSelect(null); setOpenDropdown(null); }}
          >
            <span className="skill-filter__item-label">{allLabel}</span>
            <span className="sp-dropdown__selected-mark" aria-hidden="true">&#10003;</span>
          </button>
          
          {options.map(option => (
            <button 
              key={option.slug}
              className="button button--tertiary button--sm sp-dropdown__item" 
              type="button" 
              role="option"
              tabIndex={-1}
              aria-selected={selectedValue === option.slug}
              onClick={() => { onSelect(option.slug); setOpenDropdown(null); }}
            >
              <span className="skill-filter__item-label">{option.name}</span>
              <span className="sp-dropdown__selected-mark" aria-hidden="true">&#10003;</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="skill-filter" role="group" aria-labelledby="skillFilterTitle" ref={containerRef}>
      <span className="ui-label skill-filter__label" id="skillFilterTitle">Filter by skill</span>
      <button 
        className="ui-tag skill-filter__all" 
        type="button" 
        aria-pressed={isAllSelected}
        onClick={onClearAll}
      >
        All skills
      </button>

      {renderDropdown('mood', 'Mood', 'All moods', 'ti-category-mood', moods, selectedMood, onSelectMood)}
      {renderDropdown('cognition', 'Cognition', 'All cognition', 'ti-category-cognition', cognitions, selectedCognition, onSelectCognition)}
      {renderDropdown('personality', 'Personality', 'All personality', 'ti-category-personality', personalities, selectedPersonality, onSelectPersonality)}
    </div>
  );
}
