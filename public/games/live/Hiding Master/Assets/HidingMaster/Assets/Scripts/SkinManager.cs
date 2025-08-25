using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class SkinManager : MonoBehaviour
{
    public Transform skinsPanelButtons;
    public GameObject notEnoughTokensText;

    private GameObject[] lockedSkinImages;
    private TextMeshProUGUI[] requiredTokenTexts;
    private GameObject playerHead;

    void Start()
    {
        lockedSkinImages = new GameObject[skinsPanelButtons.childCount];
        requiredTokenTexts = new TextMeshProUGUI[skinsPanelButtons.childCount];

        int index = 0;
        foreach (Transform child in skinsPanelButtons)
        {
            lockedSkinImages[index] = child.GetChild(3).gameObject;
            requiredTokenTexts[index] = lockedSkinImages[index].GetComponentInChildren<TextMeshProUGUI>();

            index++;
        }

        playerHead = GameObject.FindGameObjectWithTag("PlayerHead");

        PlayerPrefs.SetInt("Skin11Unlocked", 1);     //The last skin is unlocked
        SkinCheck();
        InitializeRequiredTokensTexts();
    }

    public void InitializeRequiredTokensTexts()
    {
        for (int i = 0; i < requiredTokenTexts.Length; i++)     //Loops through the requiedTokenTexts list and sets the texts identical to the requied count of tokens
            requiredTokenTexts[i].text = StaticVariables.requiredTokensToUnlock[i].ToString();
    }

    public void SkinCheck()
    {
        for (int i = 0; i < lockedSkinImages.Length; i++)       //Loops through the lockedSkinImages list
        {
            if (PlayerPrefs.GetInt("Skin" + i.ToString() + "Unlocked", 0) == 1)     //Checks if the list's element is unlocked             {
            {
                lockedSkinImages[i].SetActive(false);       //If it is unlocked, then the lockedImage is disabled

                if (i < lockedSkinImages.Length - 1)
                    playerHead.transform.GetChild(i).gameObject.SetActive(PlayerPrefs.GetInt("Skin", 11) == i);       //If it is unlocked, then the lockedImage is disabled
            }

            if (PlayerPrefs.GetInt("Skin", 11) == 11)
                playerHead.transform.GetChild(lockedSkinImages.Length - 2).gameObject.SetActive(false);
        }
    }

    public void SkinButton(int index)
    {
        if (PlayerPrefs.GetInt("Skin" + index + "Unlocked", 0) == 0)        //If the skin is not unlocked yet
        {
            if (PlayerPrefs.GetInt("Token", 0) < StaticVariables.requiredTokensToUnlock[index])       //If the skin cannot be unlocked
            {
                notEnoughTokensText.GetComponent<Animation>().Play();       //Plays the animation of notEnoughTokensText
                AudioManager.Instance.NotEnoughTokenSound();     //Plays notEnoughTokenSound
            }
            else    //If the skin can be unlocked
            {
                PlayerPrefs.SetInt("Skin" + index + "Unlocked", 1);     //Unlocks skin
                ScoreManager.Instance.DecrementToken(StaticVariables.requiredTokensToUnlock[index]);     //Decrements the count of tokens by requiredTokensToUnlock's value
                PlayerPrefs.SetInt("Skin", index);
                SkinCheck();        //Enables the selected skin
                AudioManager.Instance.SkinSwitchSound();     //Plays skinSwitchSound
            }
        }
        else    //If the skin is unlocked
        {
            PlayerPrefs.SetInt("Skin", index);
            SkinCheck();        //Enables the selected skin
            AudioManager.Instance.SkinSwitchSound();     //Plays skinSwitchSound
        }
    }
}
