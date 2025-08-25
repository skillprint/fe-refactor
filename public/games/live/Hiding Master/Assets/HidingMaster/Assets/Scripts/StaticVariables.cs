using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class StaticVariables : MonoBehaviour
{
    public static int plusRewardCount = 10;     //In this case, watching a rewarded ad video gives 50 tokens to the player
    public static int[] requiredTokensToUnlock = { 10, 10, 10,
                                                   10, 10, 10,
                                                   10, 10, 10,
                                                   10, 10, 0  };        //In this case, the first skin is free/unlocked, the second costs 20 tokens, the third 50 and the fourth costs 100. Change the values between the { } marks

    //Leave the following Admob IDs if you want to test the game
    public static string appID = "";        //Paste your Admob appID between the " " if you are ready to release the app
    public static string bannerID = "ca-app-pub-3940256099942544/6300978111";        //Paste your Admob bannerID between the " " marks if you are ready to release the app
    public static string interstitialID = "ca-app-pub-3940256099942544/1033173712";        //Paste your Admob interstitialID between the " " marks if you are ready to release the app
    public static string rewardVideoID = "ca-app-pub-3940256099942544/5224354917";        //Paste your Admob rewardVideoID between the " " marks if you are ready to release the app

    public static bool TestAds = true;        //This has to be true when testing, and has to be false when publishing!!!
    public static bool unityAds = false;        //Set this false if you want to use Admob, set this true if you want to use Unity Ads!!!

    //If you want to create more static variables (which have the same value at every level (scene), then you can create it here, and use it in other scripts
}
