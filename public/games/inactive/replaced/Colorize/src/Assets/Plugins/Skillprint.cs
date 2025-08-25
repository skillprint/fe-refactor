using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;
using Newtonsoft.Json;
public class Skillprint : MonoBehaviour
{
    public static bool DebugMode = false;
    [DllImport("__Internal")]
    private static extern void LogEvent(string str);
    [DllImport("__Internal")]
    private static extern void ProgressOff(); 
    //removes  UnityProgress.js bar which was made to persist in PostBuildActions.cs

#if !UNITY_EDITOR
    void Awake()
    {
        ProgressOff();
    }
#endif

    [SerializeField]
    private static string to_json(Dictionary<string, string> dict) {
        string json_str = "";
        json_str += '{';
        foreach (string key in dict.Keys)
        {
            json_str += "\"" + key + "\"";
            json_str += ':';
            json_str += "\"" +dict[key]+"\"";
            json_str += ",";
        }
        json_str = json_str.TrimEnd(',');
        json_str += '}';
        return json_str;
    }

    public static void sendTelemetry(Dictionary<string, string> t)
    {
        string json_str = Skillprint.to_json(t);
#if UNITY_EDITOR
        Debug.Log(json_str);

#elif UNITY_WEBGL
        try{
            if(!DebugMode) LogEvent(json_str);
        }catch (Exception e){
            Debug.Log("LogEvent failed");
        }
#endif
    }

#if UNITY_EDITOR
    private void Example()
    {
        Dictionary<string, string> t = new Dictionary<string, string>();
        t.Add("event", "Example");
        Skillprint.sendTelemetry(t);
    }
#endif
}
