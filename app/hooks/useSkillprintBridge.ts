'use client';

import { useEffect, useState } from 'react';

/**
 * Hook that listens for post message events from an iframe and stores the results in state, 
 * exposing that state and a callback queue that can be used to send messages to the iframe.
 */
export function useSkillprintBridge() {

    const [state, setState] = useState<any>({});
    const [callbackQueue, setCallbackQueue] = useState<any[]>([]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log('event', event);
            if (event.data.type === 'skillprint-bridge') {
                setState(event.data.state);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return {
        state,
        send: (message: any) => {
            setCallbackQueue((prev) => [...prev, message]);
        }
    };
}
