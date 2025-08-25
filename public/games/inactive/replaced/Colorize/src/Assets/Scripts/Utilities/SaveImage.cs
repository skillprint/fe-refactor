using UnityEngine;
using System.Collections;
using System.Runtime.InteropServices;

public class SaveImage {

	static string imagePath = Application.temporaryCachePath+"/temp.png";
	static bool HasHandshook = false;

	[DllImport ("__Internal")]
	static extern void saveToGallery(string message, string imagePath);
	
	public static void SaveToGallery(string imageName, byte[] imageByteArr)
	{

		System.IO.File.WriteAllBytes(imagePath, imageByteArr);
		saveToGallery(imageName, imagePath);
	}
}
