const fs = require('fs');
let content = fs.readFileSync('app/game/[slug]/GameClient.tsx', 'utf8');

const replacements = [
    {
        old: `import FloatingExitButton from '../../components/FloatingExitButton';`,
        new: `import PlayStage from '../../components/GameSession/PlayStage';\nimport SessionVeil from '../../components/GameSession/SessionVeil';\nimport PlayBar from '../../components/GameSession/PlayBar';\nimport GameResultDialog from '../../components/GameSession/GameResultDialog';`
    },
    {
        old: `    const [isIframeLoaded, setIsIframeLoaded] = useState(false);\n    const [gameState, setGameState] = useState<'playing' | 'completed' | 'paused'>('playing');`,
        new: `    type SequenceState = 'loading' | 'ready' | 'playing' | 'calculating' | 'review' | 'badge';\n    const [sequence, setSequence] = useState<SequenceState>('loading');\n    const [isGamePaused, setIsGamePaused] = useState(false);\n    const [gameResults, setGameResults] = useState<GameResults | null>(null);\n    const [sessionMood, setSessionMood] = useState<string>('Focus');\n    const [adjustmentsApplied, setAdjustmentsApplied] = useState<number>(0);\n    const adjustmentsCountRef = useRef(0);`
    },
    {
        old: `    const disableSdk = searchParams.get('sdk') === 'false';`,
        new: `    const disableSdk = searchParams.get('sdk') === 'false';\n    const devToolsEnabled = searchParams.get('dev') === 'true';`
    },
    {
        old: `    const handleIframeLoad = () => {\n        setIsIframeLoaded(true);\n        setGameStartTime(Date.now());`,
        new: `    const handleIframeLoad = () => {\n        setSequence('ready');\n        setGameStartTime(Date.now());`
    },
    {
        old: `            case 'GAME_PAUSE':\n                setGameState('paused');\n                break;\n            case 'GAME_RESUME':\n                setGameState('playing');\n                break;`,
        new: `            case 'GAME_PAUSE':\n                setIsGamePaused(true);\n                break;\n            case 'GAME_RESUME':\n                setIsGamePaused(false);\n                break;`
    },
    {
        old: `                                    console.log("Applying game adjustment:", adj);\n                                    processedAdjustmentsRef.current.add(adjId);\n                                    lastAdjustmentTimeRef.current = now;`,
        new: `                                    console.log("Applying game adjustment:", adj);\n                                    processedAdjustmentsRef.current.add(adjId);\n                                    lastAdjustmentTimeRef.current = now;\n                                    adjustmentsCountRef.current += 1;\n                                    setAdjustmentsApplied(adjustmentsCountRef.current);`
    },
    {
        old: `        if (skillprintSessionIdRef.current) {\n            router.push(\`/game/\${decodedSlug}/review?sessionId=\${skillprintSessionIdRef.current}\`);\n        }\n    };`,
        new: `        setGameResults(results);\n        setSequence('calculating');\n        setTimeout(() => {\n            setSequence('review');\n        }, 2000);\n    };`
    },
    {
        old: `        if (gameState === 'completed') {\n            // If game is already completed, just go back to games\n            handleBackToGames();\n        } else {`,
        new: `        if (sequence === 'review' || sequence === 'calculating') {\n            handleBackToGames();\n        } else {`
    },
    {
        old: `            // Navigate to review page with sessionId\n            if (skillprintSessionIdRef.current) {\n                router.push(\`/game/\${decodedSlug}/review?sessionId=\${skillprintSessionIdRef.current}\`);\n            }\n        }\n    };`,
        new: `            setGameResults(exitResults);\n            setSequence('calculating');\n            setTimeout(() => {\n                setSequence('review');\n            }, 2000);\n        }\n    };`
    },
    {
        old: `    const handlePlayAgain = () => {\n        // Reset game state\n        setGameState('playing');\n        setGameStartTime(Date.now());`,
        new: `    const handlePlayAgain = () => {\n        setSequence('loading');\n        setGameStartTime(Date.now());\n        setGameResults(null);\n        setAdjustmentsApplied(0);\n        adjustmentsCountRef.current = 0;`
    },
    {
        old: `    useEffect(() => {\n        setIsIframeLoaded(false);\n        setGameState('playing');\n        setGameStartTime(Date.now());\n        setCurrentAdjustment(null);`,
        new: `    useEffect(() => {\n        setSequence('loading');\n        setIsGamePaused(false);\n        setGameStartTime(Date.now());\n        setCurrentAdjustment(null);`
    }
];

for (const rep of replacements) {
    if (content.includes(rep.old)) {
        content = content.replace(rep.old, rep.new);
        console.log("Successfully replaced block starting with: ", rep.old.substring(0, 30));
    } else {
        console.log("Failed to find block starting with: ", rep.old.substring(0, 30));
    }
}

const returnOldIndex = content.indexOf(`    return (\n        <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900">`);
if (returnOldIndex > -1) {
    const returnNew = `    const handleTogglePlay = () => {
        if (sequence === 'playing') {
            setIsGamePaused(true);
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'GAME_PAUSE' }, '*');
            }
        } else if (sequence === 'ready') {
            setSequence('playing');
            setGameStartTime(Date.now());
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'GAME_RESUME' }, '*');
            }
        } else {
            setIsGamePaused(false);
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'GAME_RESUME' }, '*');
            }
        }
    };

    return (
        <div className="page scrollbar-subtle page--game-session margin-none text-default font-ui leading-base" data-sequence={sequence} data-skillprint-page="game-session">
            <div aria-hidden="true" className="play-field" data-stage-field>
                <img alt="" className="play-field__art" data-stage-art src={\`/assets/images/games/game-\${decodedSlug}.svg\`} onError={(e) => (e.currentTarget.style.display = 'none')} />
                
                {!isLoadingGamePath && (
                    <iframe
                        ref={iframeRef}
                        src={gamePath}
                        className="w-full h-full border-0 absolute inset-0 z-10"
                        title={\`\${decodedSlug} Game\`}
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        onLoad={handleIframeLoad}
                        style={{
                            opacity: (sequence === 'playing' || sequence === 'calculating' || sequence === 'review' || sequence === 'ready') ? 1 : 0,
                            pointerEvents: sequence === 'playing' ? 'auto' : 'none'
                        }}
                    />
                )}
            </div>

            {sequence === 'ready' && (
                <PlayStage gameTitle={gameConfig?.title || decodedSlug} onPlay={() => handleTogglePlay()} />
            )}

            {sequence === 'loading' && (
                <SessionVeil step="loading" title="Loading game" description={\`\${gameConfig?.title || decodedSlug} is starting up.\`} isCanvas />
            )}

            {sequence === 'calculating' && (
                <SessionVeil step="calculating" title="Calculating results" description="Just a moment while we analyse your gameplay." />
            )}

            {sequence === 'review' && gameResults && (
                <GameResultDialog
                    gameTitle={gameConfig?.title || decodedSlug}
                    score={gameResults.score || 0}
                    highScore={gameConfig?.highScore || 0}
                    duration={gameResults.time || 0}
                    adjustmentsCount={adjustmentsApplied}
                    targetMood={sessionMood}
                    onClose={handleBackToGames}
                    onReplay={handlePlayAgain}
                />
            )}

            {sequence === 'playing' && (
                <PlayBar
                    gameTitle={gameConfig?.title || decodedSlug}
                    gameSlug={decodedSlug}
                    score={0} // Default since score is mostly calculated at the end right now
                    highScore={gameConfig?.highScore || 0}
                    isPlaying={!isGamePaused}
                    onTogglePlay={handleTogglePlay}
                    onExit={handleExitGame}
                    targetMood={sessionMood}
                />
            )}

            {/* Sequence steps for testing */}
            {devToolsEnabled && (
                <nav aria-label="Sequence steps" className="session-rail layout-flex items-center" style={{ position: 'fixed', bottom: 10, left: 10, zIndex: 9999 }}>
                    <button aria-pressed={sequence === 'loading'} className="session-rail__step button button--tertiary" onClick={() => setSequence('loading')} type="button">Load</button>
                    <button aria-pressed={sequence === 'ready'} className="session-rail__step button button--tertiary" onClick={() => setSequence('ready')} type="button">Start</button>
                    <button aria-pressed={sequence === 'playing'} className="session-rail__step button button--tertiary" onClick={() => setSequence('playing')} type="button">Play</button>
                    <button aria-pressed={sequence === 'calculating'} className="session-rail__step button button--tertiary" onClick={() => setSequence('calculating')} type="button">Calculate</button>
                    <button aria-pressed={sequence === 'review'} className="session-rail__step button button--tertiary" onClick={() => setSequence('review')} type="button">Review</button>
                </nav>
            )}

            {/* Hidden keyboard adjustment tester */}
            {!disableAdjustments && (
                <GameAdjustmentTester
                    iframeRef={iframeRef}
                    slug={decodedSlug}
                    onAdjustment={(adj) => setCurrentAdjustment(adj)}
                />
            )}

            {/* Adjustment Banner */}
            {currentAdjustment && (
                <GameAdjustmentBanner
                    parameterName={currentAdjustment.parameterName}
                    parameterValue={currentAdjustment.parameterValue}
                    onDismiss={() => setCurrentAdjustment(null)}
                />
            )}
        </div>
    );
}`;
    content = content.substring(0, returnOldIndex) + returnNew;
    console.log("Successfully replaced return block.");
} else {
    console.log("Failed to find return block");
}

fs.writeFileSync('app/game/[slug]/GameClient.tsx', content);

