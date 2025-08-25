// "use client";
// import { has } from 'lodash';
// import { post, get } from './api';
// import { ShimListener } from "./ShimListener";
// import GameRecorderParser from './GameRecorderParser';

// class GameRecorder {
//     shimListner: ShimListener = new ShimListener(100, () => {});
//     gameSlug : any = null;
//     screenStream : any = null;
//     webcamStream : any = null;
//     combinedStream : any = null;
//     sessionId : any = null;
//     stream : any = null;
//     mediaRecorder : any = null;
//     chunkInterval : any = null;
//     mimeType : any = 'video/mp4;codecs=vp8,opus';
//     chunkDuration : any = 5000; // 5 seconds per chunk
//     isLastChunk : any = false;
//     telemetryInterval : any = null;
//     screenshotTransmissionInterval : any = null;
//     telemetryDatas: any = [];
//     onTelemetryUpdateCallback : any = null;
//     webcamVideo : any = null;
//     recordingModal : any = null;
//     targetMood : any = null;
//     useScreenCapture: any = false;
//     bufferedLastChunk: any = null;
//     bufferedLastScreenshot: any = null;
//     isTransmittingLastChunk: any = false;

//     constructor(gameSlug: any) {
//         this.gameSlug = gameSlug;
//         this.screenStream = null;
//         this.webcamStream = null;
//         this.combinedStream = null;
//         this.mediaRecorder = null;
//         this.chunkInterval = null;
//         this.mimeType = 'video/mp4;codecs=vp8,opus';
//         this.chunkDuration = 5000; // 5 seconds per chunk
//         this.isLastChunk = false;
//         this.targetMood = null;
//         this.setupBeforeUnloadListener();
//         this.telemetryInterval = null;
//         // Bind methods to ensure 'this' context
//         this.startTelemetryFetch = this.startTelemetryFetch.bind(this);
//         this.fetchTelemetryData = this.fetchTelemetryData.bind(this);
//         this.bufferedLastChunk = null;
//         this.bufferedLastScreenshot = null;
//         this.screenshotTransmissionInterval = null;
//     }

//     async startRecording() {
//         await this.createSession();
//         this.startTelemetryFetch();
        
//         this.screenshotTransmissionInterval = setInterval(() => {
//             this.transmitScreenshots().catch(error => console.error("Error in periodic screenshot transmission:", error));
//         }, 5000);

//         console.log("Recording started");
//     }

//     stopRecording() {
//         clearInterval(this.telemetryInterval);
//         clearInterval(this.screenshotTransmissionInterval);
//         this.transmitLastChunk();
//         console.log("Recording stopped");
//     }

//     handleError(error: any) {
//         console.error("MediaRecorder error:", error);
//     }

//     getTargetMood() {
//         let moodToTransmit : string = this.targetMood;

//         if(window && window?.incomingContext == 'mood' && window?.incomingContextValue) {
//             moodToTransmit = window?.incomingContextValue;
//         }

//         console.log(moodToTransmit);
        
//         return (moodToTransmit && moodToTransmit.toLowerCase()) || 'relax';
//     }

//     async transmitLastChunk() {
//         this.transmitLastScreenshot();
//     }

//     async transmitLastScreenshot() {
//         this.isLastChunk = true;
//         this.transmitScreenshots();
//     }

//     async transmitScreenshots() {
//         const screenshots = this.shimListner.getBuffer();

//         let jsonData: any;
        
//         if(screenshots.length >= 0) {
//             jsonData = {
//                 'is_last_chunk': this.isLastChunk,
//                 'screenshots': screenshots.map((message: any, index: any) => {
//                     if (message.type === 'screenshot') {
//                         return message.dataUrl;
//                     }
//                 })
//             }

//             this.bufferedLastScreenshot = screenshots[screenshots.length - 1];

//             this.shimListner.clearBuffer();
//         } else {
//             return;
//         }

//         const response = await post(`games/api/record-session/${this.sessionId}/`, jsonData, { "Content-Type": "application/json" })

//         if (response.status !== 200 && response.status !== 201) {
//             throw new Error(`HTTP error! transmitting screenshots status: ${response.status}`);
//         }

//         console.log("Screenshots transmitted successfully");
//     }

//     async createSession() {
//         this.sessionId = this.generateUUID();
        
//         const formData = {
//             'sessionId': this.sessionId,
//             'game': this.gameSlug,
//             "duration": 0,
//             'targetMood': this.getTargetMood() || 'relax',
//         }
        
//         const response = await post(`games/api/sessions/`, formData, { "Content-Type": "application/json" })

//         if (response.status !== 200 && response.status !== 201) {
//             console.error("Failed to create session:", response);
//             throw new Error('Failed to create session');
//         }
//     }

//     generateUUID() {
//         return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//             var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
//             return v.toString(16);
//         });
//     }

//     setupBeforeUnloadListener() {
//         window.addEventListener('beforeunload', async (event) => {
//             if (this.stream) {
//                 event.preventDefault();
//                 event.returnValue = '';

//                 this.isLastChunk = true;
//                 await this.stopRecording();
//             }
//         });
//     }

//     startTelemetryFetch() {
//         // Update session ID display
//         const sessionIdElement = document.getElementById('sessionID');
//         if (sessionIdElement) {
//             sessionIdElement.textContent = this.sessionId;
//         }

//         console.log("Telemetry fetch disabled for now");
//         // Start fetching telemetry data
//         this.telemetryInterval = setInterval(() => {
//             this.fetchTelemetryData().catch(error => console.error("Error in periodic telemetry fetch:", error));
//         }, 5000);
//     }

//     async fetchTelemetryData() {
//         console.log("fetchTelemetryData called");
//         console.log(`Fetching telemetry for session ID: ${this.sessionId}`);

//         if (!this.sessionId) {
//             console.error("Session ID is not set. Cannot fetch telemetry.");
//             return;
//         }

//         try {
//             console.log(`Sending fetch request to: /games/api/sessions/${this.sessionId}`);
//             const response = await get(`games/api/sessions/${this.sessionId}`)

//             console.log("Fetch response received:", response);

//             if (response.status !== 200 && response.status !== 201) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             console.log("Parsing response as JSON");
//             const data = await response.data;
//             this.telemetryDatas.push(data);
//             // console.log("Parsed data:", JSON.stringify(data, null, 2));

//             if (Array.isArray(data) && data.length > 0) {
//                 const sessionData = data[0]; // Get the first (and likely only) session object
//                 if (sessionData.telemetry && sessionData.telemetry.length > 0) {
//                     console.log("Telemetry data found in response");
//                     const latestTelemetry = sessionData.telemetry[sessionData.telemetry.length - 1];
//                     console.log("Latest telemetry:", latestTelemetry);

//                     const telemetryElement = document.getElementById('latestTelemetry');
//                     if (telemetryElement) {
//                         console.log("Updating telemetry element in DOM");
//                         telemetryElement.textContent = JSON.stringify(latestTelemetry, null, 2);
//                         console.log("Telemetry element updated");
//                         const moodElement = document.getElementById('mood');
//                         const tipsElement = document.getElementById('tips');
//                         if (moodElement && tipsElement) {
//                             moodElement.textContent = JSON.stringify(latestTelemetry.mood, null, 2);
//                             tipsElement.textContent = JSON.stringify(latestTelemetry.tips, null, 2);
//                         } else {
//                             console.error("Telemetry element not found in the DOM");
//                         }
//                     } else {
//                         console.error("Telemetry element not found in the DOM");
//                     }
//                 } else {
//                     console.log("No telemetry data found in the session data");
//                 }
//             } else {
//                 console.log("No valid session data found in response");
//             }
//         } catch (error) {
//             console.error("Error in fetchTelemetryData:", error);
//         }

//         console.log("fetchTelemetryData completed");
//     }

//     async fetchClosedSessionData() {
//         console.log("fetchClosedSessionData called");
//         console.log(`Fetching closed session data for session ID: ${this.sessionId}`);

//         if (!this.sessionId) {
//             console.error("Session ID is not set. Cannot fetch closed session data.");
//             return;
//         }

//         try {
//             const result = await get(`games/api/sessions/${this.sessionId}`)
//             console.log("Closed session data received:", result);
//             if(result.data)
//                 return result.data;
//         } catch (error) {
//             console.error("Error in fetchClosedSessionData:", error);
//         }
//     }


//     getLatestTelemetryData() {
//         return this.telemetryDatas && this.telemetryDatas.length && this.telemetryDatas[this.telemetryDatas.length - 1] || null;
//     }

//     hasLatestGameAdjustment() {
//         const latestTelemetry = this.getLatestTelemetryData();
//         return latestTelemetry && latestTelemetry.telemetry && latestTelemetry.telemetry.length > 0 && has(latestTelemetry.telemetry[0], 'adjustment');
//     }

//     getLatestGameAdjustment() {
//         const latestTelemetry = this.getLatestTelemetryData();

//         if(latestTelemetry && latestTelemetry.telemetry && latestTelemetry.telemetry.length > 0) {
//             return latestTelemetry.telemetry[0] && latestTelemetry.telemetry[0].adjustment;
//         }

//         return null;
//     }

//     hasUsableTelemetryForSkillprintScreen() {
//         if(!this.telemetryDatas || this.telemetryDatas.length === 0) {
//             return false;
//         }

//         const latestTelemetry = this.getLatestTelemetryData();

//         const parser = new GameRecorderParser(latestTelemetry);

//         console.log("Checking if telemetry data is usable for Skillprint screen");
//         console.log(parser.hasUsableTelemetry(), parser.hasSkillScores(), parser.hasMoodScores(), latestTelemetry)

//         return parser.hasUsableTelemetry() && parser.hasSkillScores() && parser.hasMoodScores();
        
//     }
// }

// export default GameRecorder;