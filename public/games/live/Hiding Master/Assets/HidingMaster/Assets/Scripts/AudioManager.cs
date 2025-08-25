using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AudioManager : MonoBehaviour
{

    //------------------------CREDITS----------------------------
    //Background music by Eric Matyas: http://www.soundimage.org
    //Sound effects: https://www.noiseforfun.com
    //-----------------------------------------------------------

    [SerializeField]
    private AudioSource backgroundMusic, tokenSound, levelClearedSound, deathSound, buttonClickSound, skinSwitchSound, notEnoughTokenSound, paintSound, teleportSound, doorSound, catchedSound;

    [HideInInspector]
    public bool soundIsOn = true;       //GameManager script might modify this value

    public static AudioManager Instance;

    private void Awake()
    {
        Instance = this;
    }

    //Functions are called by other scripts when it is necessary

    public void StopBackgroundMusic()
    {
        backgroundMusic.Stop();
    }

    public void PlayBackgroundMusic()
    {
        if (soundIsOn)
            backgroundMusic.Play();
    }

    public void TokenSound()
    {
        if (soundIsOn)
            tokenSound.Play();
    }

    public void LevelClearedSound()
    {
        if (soundIsOn)
            levelClearedSound.Play();
    }

    public void DeathSound()
    {
        if (soundIsOn)
            deathSound.Play();
    }

    public void ButtonClickSound()
    {
        if (soundIsOn)
            buttonClickSound.Play();
    }

    public void NotEnoughTokenSound()
    {
        if (soundIsOn)
            notEnoughTokenSound.Play();
    }

    public void SkinSwitchSound()
    {
        if (soundIsOn)
            skinSwitchSound.Play();
    }

    public void CaughtSound()
    {
        if (soundIsOn)
            catchedSound.Play();
    }

    public void DoorSound()
    {
        if (soundIsOn)
            doorSound.Play();
    }

    public void TeleportSound()
    {
        if (soundIsOn)
            teleportSound.Play();
    }

    public void PaintSound()
    {
        if (soundIsOn)
            paintSound.Play();
    }
}
