using UnityEngine;
using System.Runtime.InteropServices;

public class InstagramShare
{
	static string imagePath = Application.temporaryCachePath + "/temp.png";
	
	static bool HasHandshook = false;
	
	[DllImport("__Internal")]
	static extern void _handshake();
	
	public static void HandShake() 
	{
		_handshake();
		HasHandshook = true;
	}
	
	[DllImport ("__Internal")]
	static extern void _postToInstagram (string message, string imagePath);
	
	public static void PostToInstagram(string message, byte[] imageByteArr)
	{
		if(!HasHandshook)
			HandShake();
		
		System.IO.File.WriteAllBytes(imagePath, imageByteArr);
		_postToInstagram(message, imagePath);
	}
}