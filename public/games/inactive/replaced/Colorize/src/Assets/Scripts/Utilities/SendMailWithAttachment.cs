using UnityEngine;
using System.Collections;
using System.Runtime.InteropServices;
public class SendMailWithAttachment
{

	static string imagePath = Application.temporaryCachePath+"/temp.png";
	
	[DllImport ("__Internal")]
	static extern void sendMailAttachment(string message, string imagePath);
	[DllImport ("__Internal")]
	static extern void sendMessageAttachment(string message,string imagePath);
	
	public static void SendMailAttach(string imageName, byte[] imageByteArr)
	{
		
		System.IO.File.WriteAllBytes(imagePath, imageByteArr);
		sendMailAttachment(imageName, imagePath);
	}
	public static void SendMessageWithImage(string imageName, byte[] imageByteArr)
	{
		Debug.Log("SMs CALL");
		System.IO.File.WriteAllBytes(imagePath, imageByteArr);
		sendMessageAttachment(imageName, imagePath);
	}
}
