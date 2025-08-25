using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class RewardButton : MonoBehaviour
{
    //public int rewardCount = 5;

    public static RewardButton Instance;

    private void Awake()
    {
        Instance = this;
    }

    void Start()
    {
        transform.Find("Text").gameObject.GetComponent<TextMeshProUGUI>().text = "+" + StaticVariables.plusRewardCount.ToString();      //For example, if the rewardCount equals 5, then the text is: +5
    }

    public void AddReward()
    {
        ScoreManager.Instance.IncrementToken(StaticVariables.plusRewardCount);       //Increments token by the given value
    }

    public void ShowRewardVideo()
    {
        //UNCOMMENT THE FOLLOWING LINES IF YOU ENABLED UNITY ADS AT UNITY SERVICES AND REOPENED THE PROJECT!
        //if (AdManager.Instance.unityAds)
        //    AdManager.Instance.ShowUnityRewardVideoAd();       //Shows Unity Reward Video ad
        //else
        AdManager.Instance.ShowAdmobRewardVideo(0);       //Shows Admob Reward Video ad
    }
}
