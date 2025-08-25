using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class ScoreManager : MonoBehaviour {

    public TextMeshProUGUI tokenText;

    private Animation tokenTextAnim;

    public static ScoreManager Instance;

    private void Awake()
    {
        Instance = this;
    }

    void Start()
    {
        tokenTextAnim = tokenText.gameObject.GetComponent<Animation>();     //Initializes tokenTextAnim
        tokenText.text = PlayerPrefs.GetInt("Token", 0).ToString();     //Writes out the number of tokens to the screen
    }

    public void IncrementToken(int countOfToken = 1)
    {
        if (GameManager.Instance.gameIsOver == false)       //If the game is not over
        {
            PlayerPrefs.SetInt("Token", PlayerPrefs.GetInt("Token", 0) + countOfToken);        //Increases the number of tokens
            tokenText.text = PlayerPrefs.GetInt("Token", 0).ToString();     //Writes out the number of tokens to the screen
            tokenTextAnim.Play();       //Plays tokenTextAnim
            AudioManager.Instance.TokenSound();      //Plays tokenSound
        }
    }

    public void DecrementToken(int decreaseValue = 1)
    {
        PlayerPrefs.SetInt("Token", PlayerPrefs.GetInt("Token", 0) - decreaseValue);        //Decreases the number of tokens by decreaseValue
        tokenText.text = PlayerPrefs.GetInt("Token", 0).ToString();     //Writes out the number of tokens to the screen
    }
}
