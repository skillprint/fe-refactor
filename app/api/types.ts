// globalThis window extension

declare global {
    interface Window {
        incomingContext: string;
        incomingContextValue: string;
    }
}

export default Window