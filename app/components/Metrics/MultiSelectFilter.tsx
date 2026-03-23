import { FilterType, MetricsFilter } from '../../hooks/useMetricsData';

interface MultiSelectFilterProps {
    filters: MetricsFilter[];
    onFilterChange: (filters: MetricsFilter[]) => void;
    availableMoods: any[];
    availableSkills: any[];
    availableGames: any[];
    getColorForSlug: (slug: string) => string;
}

export default function MultiSelectFilter({
    filters,
    onFilterChange,
    availableMoods,
    availableSkills,
    availableGames,
    getColorForSlug
}: MultiSelectFilterProps) {

    const handleToggle = (type: FilterType, slug: string) => {
        const newFilters = [...filters];
        const existingFilter = newFilters.find(f => f.type === type);

        if (existingFilter) {
            if (existingFilter.slugs.includes(slug)) {
                existingFilter.slugs = existingFilter.slugs.filter(s => s !== slug);
            } else {
                existingFilter.slugs.push(slug);
            }
        } else {
            newFilters.push({ type, slugs: [slug] });
        }

        onFilterChange(newFilters);
    };

    const renderSection = (title: string, type: FilterType, items: any[], getDisplaySlug: (item: any) => string, getDisplayName: (item: any) => string) => {
        if (!items || items.length === 0) return null;
        const activeFilter = filters.find(f => f.type === type);
        const activeSlugs = activeFilter?.slugs || [];

        return (
            <div className="mb-6">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">{title}</h3>
                <div className="flex flex-wrap gap-2">
                    {items.map((item) => {
                        const slug = getDisplaySlug(item);
                        const isSelected = activeSlugs.includes(slug);
                        const color = getColorForSlug(slug);

                        return (
                            <button
                                key={slug}
                                onClick={() => handleToggle(type, slug)}
                                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 border-2`}
                                style={{
                                    backgroundColor: isSelected ? color : 'transparent',
                                    borderColor: color,
                                    color: isSelected ? '#ffffff' : color
                                }}
                            >
                                {getDisplayName(item)}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Filters</h2>
            {renderSection('Moods', 'mood', availableMoods, (m) => m.slug, (m) => m.name)}
            {renderSection('Skills', 'skill', availableSkills, (s) => s.slug, (s) => s.name)}
            {renderSection('Games', 'game', availableGames, (g) => g.slug, (g) => g.name)}
        </div>
    );
}
