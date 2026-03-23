import { Timeframe } from '../../hooks/useMetricsData';

interface DateJumperProps {
    currentDate: Date;
    timeframe: Timeframe;
    onDateChange: (newDate: Date) => void;
    onTimeframeChange: (newTimeframe: Timeframe) => void;
}

export default function DateJumper({ currentDate, timeframe, onDateChange, onTimeframeChange }: DateJumperProps) {
    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (timeframe === 'Day') {
            newDate.setDate(newDate.getDate() - 1);
        } else if (timeframe === 'Week') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setMonth(newDate.getMonth() - 1);
        }
        onDateChange(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (timeframe === 'Day') {
            newDate.setDate(newDate.getDate() + 1);
        } else if (timeframe === 'Week') {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        onDateChange(newDate);
    };

    const formatCurrentDateRange = () => {
        if (timeframe === 'Day') {
            return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        } else if (timeframe === 'Week') {
            const start = new Date(currentDate);
            start.setDate(currentDate.getDate() - currentDate.getDay());
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else {
            return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4 my-6">
            {/* Segmented Control */}
            <div className="flex bg-muted p-1 rounded-xl shadow-inner w-full max-w-sm">
                {(['Day', 'Week', 'Month'] as Timeframe[]).map((tf) => (
                    <button
                        key={tf}
                        onClick={() => onTimeframeChange(tf)}
                        className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${timeframe === tf
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tf}
                    </button>
                ))}
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between w-full max-w-sm px-4">
                <button
                    onClick={handlePrev}
                    className="text-primary hover:text-primary/80 transition-colors p-2 rounded-full hover:bg-muted"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="text-lg font-bold text-foreground mx-4 min-w-[120px] text-center">
                    {formatCurrentDateRange()}
                </div>
                <button
                    onClick={handleNext}
                    className="text-primary hover:text-primary/80 transition-colors p-2 rounded-full hover:bg-muted"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
