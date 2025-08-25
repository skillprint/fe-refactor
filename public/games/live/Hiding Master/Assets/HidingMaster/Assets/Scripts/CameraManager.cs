using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Cinemachine;

public class CameraManager : MonoBehaviour
{
    public static CameraManager Instance;

    private void Awake()
    {
        Instance = this;
    }

    #region CamereaChoosingMethods

    public void LookAtClosePlayer()
    {
        CinemachineVirtualCamera virtualCam = transform.Find("ClosePlayer").GetComponent<CinemachineVirtualCamera>();

        virtualCam.Priority = GetBiggestCameraPriority() + 1;
        virtualCam.Follow = virtualCam.LookAt = GameObject.FindGameObjectWithTag("Player").transform;
    }

    public void LookAtFar()
    {
        transform.Find("Far").GetComponent<CinemachineVirtualCamera>().Priority = GetBiggestCameraPriority() + 1;
    }

    public void LookAtPlayerSeek()
    {
        CinemachineVirtualCamera virtualCam = transform.Find("PlayerSeek").GetComponent<CinemachineVirtualCamera>();

        virtualCam.Priority = GetBiggestCameraPriority() + 1;
        virtualCam.Follow = virtualCam.LookAt = GameObject.FindGameObjectWithTag("Player").transform;
    }

    public void LookAtPlayerSkin()
    {
        transform.Find("PlayerSkin").GetComponent<CinemachineVirtualCamera>().Priority = GetBiggestCameraPriority() + 1;
    }

    public void LookAtPlayerClosest()
    {
        CinemachineVirtualCamera virtualCam = transform.Find("PlayerClosest").GetComponent<CinemachineVirtualCamera>();

        virtualCam.Priority = GetBiggestCameraPriority() + 1;
        virtualCam.Follow = virtualCam.LookAt = GameObject.FindGameObjectWithTag("Player").transform;
    }

    #endregion

    private int GetBiggestCameraPriority()
    {
        int biggestPriority = 0;

        foreach (var camera in GetComponentsInChildren<CinemachineVirtualCamera>())
        {
            if (camera.Priority > biggestPriority)
                biggestPriority = camera.Priority;
        }

        return biggestPriority;
    }
}
