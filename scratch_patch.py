import re

with open('app/game/[slug]/GameClient.tsx', 'r') as f:
    content = f.read()

# 1. Add imports
imports = """import PlayStage from '../../components/GameSession/PlayStage';
import SessionVeil from '../../components/GameSession/SessionVeil';
import PlayBar from '../../components/GameSession/PlayBar';
import GameResultDialog from '../../components/GameSession/GameResultDialog';
"""
content = content.replace(
    "import FloatingExitButton from '../../components/FloatingExitButton';",
    imports
)

# 2. State variables
states_old = """    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    const [gameState, setGameState] = useState<'playing' | 'completed' | 'paused'>('playing');"""
states_new = """    type SequenceState = 'loading' | 'ready' | 'playing' | 'calculating' | 'review' | 'badge';
    const [sequence, setSequence] = useState<SequenceState>('loading');
    const [isGamePaused, setIsGamePaused] = useState(false);
    const [gameResults, setGameResults] = useState<GameResults | null>(null);
    const [sessionMood, setSessionMood] = useState<string>('Focus');
    const [adjustmentsApplied, setAdjustmentsApplied] = useState<number>(0);
    const adjustmentsCountRef = useRef(0);"""
content = content.replace(states_old, states_new)

# 3. getApiKey / SearchParams
sp_old = """    const disableSdk = searchParams.get('sdk') === 'false';"""
sp_new = """    const disableSdk = searchParams.get('sdk') === 'false';
    const devToolsEnabled = searchParams.get('dev') === 'true';"""
content = content.replace(sp_old, sp_new)


# 4. handleIframeLoad
iframe_load_old = """    const handleIframeLoad = () => {
        setIsIframeLoaded(true);
        setGameStartTime(Date.now());"""
iframe_load_new = """    const handleIframeLoad = () => {
        setSequence('ready');
        setGameStartTime(Date.now());"""
content = content.replace(iframe_load_old, iframe_load_new)

# 5. handleGameMessage pause/resume
msg_old = """            case 'GAME_PAUSE':
                setGameState('paused');
                break;
            case 'GAME_RESUME':
                setGameState('playing');
                break;"""
msg_new = """            case 'GAME_PAUSE':
                setIsGamePaused(true);
                break;
            case 'GAME_RESUME':
                setIsGamePaused(false);
                break;"""
content = content.replace(msg_old, msg_new)

# 6. Apply adjustment tracking
adj_old = """                                    console.log("Applying game adjustment:", adj);
                                    processedAdjustmentsRef.current.add(adjId);
                                    lastAdjustmentTimeRef.current = now;"""
adj_new = """                                    console.log("Applying game adjustment:", adj);
                                    processedAdjustmentsRef.current.add(adjId);
                                    lastAdjustmentTimeRef.current = now;
                                    adjustmentsCountRef.current += 1;
                                    setAdjustmentsApplied(adjustmentsCountRef.current);"""
content = content.replace(adj_old, adj_new)

# 7. handleGameComplete
complete_old = """        if (skillprintSessionIdRef.current) {
            router.push(`/game/${decodedSlug}/review?sessionId=${skillprintSessionIdRef.current}`);
        }
    };"""
complete_new = """        setGameResults(results);
        setSequence('calculating');
        setTimeout(() => {
            setSequence('review');
        }, 2000);
    };"""
content = content.replace(complete_old, complete_new)

# 8. handleExitGame
exit_old = """        if (gameState === 'completed') {
            // If game is already completed, just go back to games
            handleBackToGames();
        } else {"""
exit_new = """        if (sequence === 'review' || sequence === 'calculating') {
            handleBackToGames();
        } else {"""
content = content.replace(exit_old, exit_new)

exit_end_old = """            // Navigate to review page with sessionId
            if (skillprintSessionIdRef.current) {
                router.push(`/game/${decodedSlug}/review?sessionId=${skillprintSessionIdRef.current}`);
            }
        }
    };"""
exit_end_new = """            setGameResults(exitResults);
            setSequence('calculating');
            setTimeout(() => {
                setSequence('review');
            }, 2000);
        }
    };"""
content = content.replace(exit_end_old, exit_end_new)

# 9. handlePlayAgain
play_again_old = """    const handlePlayAgain = () => {
        // Reset game state
        setGameState('playing');
        setGameStartTime(Date.now());"""
play_again_new = """    const handlePlayAgain = () => {
        setSequence('loading');
        setGameStartTime(Date.now());
        setGameResults(null);
        setAdjustmentsApplied(0);
        adjustmentsCountRef.current = 0;"""
content = content.replace(play_again_old, play_again_new)

# 10. Reset state in useEffect
reset_old = """    useEffect(() => {
        setIsIframeLoaded(false);
        setGameState('playing');
        setGameStartTime(Date.now());
        setCurrentAdjustment(null);"""
reset_new = """    useEffect(() => {
        setSequence('loading');
        setIsGamePaused(false);
        setGameStartTime(Date.now());
        setCurrentAdjustment(null);"""
content = content.replace(reset_old, reset_new)

# 11. Return statement
return_old = """    return (
        <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col min-h-screen">
                {/* Game iframe */}
                <main className="flex-1 relative">
                    {isLoadingGamePath ? (
                        <div className="w-full h-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 border-0">
                            <div className="flex flex-col items-center gap-4">
                                <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Loading Game...</span>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            ref={iframeRef}
                            src={gamePath}
                            className="w-full h-full min-h-screen border-0"
                            title={`${decodedSlug} Game`}
                            allowFullScreen
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                            onLoad={handleIframeLoad}
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

                    {/* Floating exit button - only show when iframe is loaded */}
                    {isIframeLoaded && (
                        <FloatingExitButton
                            position={gameConfig.exitButtonPosition}
                            color={gameConfig.customExitButton?.color || 'red'}
                            size={gameConfig.customExitButton?.size || 'md'}
                            onClick={handleExitGame}
                        />
                    )}

                    {/* Hidden keyboard adjustment tester */}
                    {!disableAdjustments && (
                        <GameAdjustmentTester
                            iframeRef={iframeRef}
                            slug={decodedSlug}
                            onAdjustment={(adj) => setCurrentAdjustment(adj)}
                        />
                    )}
                </main>
            </div>




        </div>
    );"""

return_new = """    const handleTogglePlay = () => {
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
                <img alt="" className="play-field__art" data-stage-art src={`/assets/images/games/game-${decodedSlug}.svg`} onError={(e) => (e.currentTarget.style.display = 'none')} />
                
                {!isLoadingGamePath && (
                    <iframe
                        ref={iframeRef}
                        src={gamePath}
                        className="w-full h-full border-0 absolute inset-0 z-10"
                        title={`${decodedSlug} Game`}
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
                <SessionVeil step="loading" title="Loading game" description={`${gameConfig?.title || decodedSlug} is starting up.`} isCanvas />
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
    );"""

content = content.replace(return_old, return_new)

with open('app/game/[slug]/GameClient.tsx', 'w') as f:
    f.write(content)
