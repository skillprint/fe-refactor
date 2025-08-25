using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;
using Newtonsoft.Json;
public class Skillprint : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void LogEvent(string str);
    [DllImport("__Internal")]
    private static extern void ProgressOff();
    void Awake()
    {
        ProgressOff();
        Screen.orientation = ScreenOrientation.LandscapeLeft;
    }
    private static bool DebugMode = false;
    static private JsonSerializerSettings jss = new JsonSerializerSettings
    {
        NullValueHandling = NullValueHandling.Ignore
    };
[SerializeField]
    public struct telemetry {
        public string @event;
        public int max_sheep;
        public int current_sheep;
    }

    public static void sendTelemetry(telemetry t) {
        string json_str = JsonConvert.SerializeObject(t, jss);
#if UNITY_EDITOR
        Debug.Log(json_str);
        try
        {
            if (!DebugMode) LogEvent(json_str);
        }
        catch (Exception e)
        {
            Debug.Log("logEvent Failed");
        }
#endif
    }
}
