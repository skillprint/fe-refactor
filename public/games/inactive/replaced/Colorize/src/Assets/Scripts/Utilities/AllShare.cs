using UnityEngine;
using System.Collections;
using System.Runtime.InteropServices;

public class AllShare {
	
	static string imagePath = Application.temporaryCachePath+"/temp.png";
	static bool HasHandshook = false;
	
	[DllImport ("__Internal")]
	static extern void openShare(string imagePath);
	
	public static void MultiShare(string imageName, byte[] imageByteArr)
	{
		
		System.IO.File.WriteAllBytes(imagePath, imageByteArr);
		openShare(imagePath);
	}
}
