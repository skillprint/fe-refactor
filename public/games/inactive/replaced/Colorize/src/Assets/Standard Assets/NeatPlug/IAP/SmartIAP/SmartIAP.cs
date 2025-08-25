/**
 * SmartIAP.cs
 * 
 * A Singleton class encapsulating public access methods for Google IAB processes. 
 * 
 * Please read the code comments carefully, or visit 
 * http://www.neatplug.com/integration-guide-unity3d-smart-iap-plugin to find information how 
 * to use this program.
 * 
 * End User License Agreement: http://www.neatplug.com/eula
 * 
 * (c) Copyright 2013 NeatPlug.com All rights reserved.
 * 
 * @version 1.2.9
 * @google_iab_api v3 
 * @amazon_iap_api v1.0.3
 * @samsung_iap_api v2
 *
 */

using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;

public class SmartIAP  {	
	
	#region Fields
	
	private static SmartIAP _instance = null;	
	
	private class SmartIAPNativeHelper : ISmartIAPNativeHelper {
		
#if UNITY_ANDROID	
		private AndroidJavaObject _plugin = null;
#endif		
		public SmartIAPNativeHelper()
		{
			
		}
		
		public void CreateInstance(string className, string instanceMethod)
		{	
#if UNITY_ANDROID			
			AndroidJavaClass jClass = new AndroidJavaClass(className);
			_plugin = jClass.CallStatic<AndroidJavaObject>(instanceMethod);	
#endif			
		}
		
		public void Call(string methodName, params object[] args)
		{
#if UNITY_ANDROID			
			_plugin.Call(methodName, args);	
#endif
		}
		
		public void Call(string methodName, string signature, object arg)
		{
#if UNITY_ANDROID			
			var method = AndroidJNI.GetMethodID(_plugin.GetRawClass(), methodName, signature);			
			AndroidJNI.CallObjectMethod(_plugin.GetRawObject(), method, AndroidJNIHelper.CreateJNIArgArray(new object[] {arg}));
#endif			
		}
		
		public ReturnType Call<ReturnType> (string methodName, params object[] args)
		{
#if UNITY_ANDROID			
			return _plugin.Call<ReturnType>(methodName, args);
#else
			return default(ReturnType);			
#endif			
		}
	
	};		
	
	#endregion
	
	#region Functions	
	
	/**
	 * Constructor.
	 */
	private SmartIAP()
	{	
#if UNITY_ANDROID		
		SmartIAPAndroid.Instance().SetNativeHelper(new SmartIAPNativeHelper());
#endif
#if UNITY_IPHONE		
		SmartIAPIOS.Instance();
#endif		
	}
	
	/**
	 * Instance method.
	 */
	public static SmartIAP Instance()
	{		
		if (_instance == null) 
		{
			_instance = new SmartIAP();
		}
		
		return _instance;
	}	
	
	/**
	 * Initialization.
	 * 
	 * @param store
	 *              SmartIAPStoreSelection - Select a store. This is basically for testing purpose, since
	 *                                       only App downloaded from store can be accurately detected for
	 *                                       the source. (Only affects Android stores, iOS has only one 
	 *                                       option - Apple AppStore).
	 *                                       You should select "AutoDetect" before you submit your apk to 
	 *                                       stores.	                                     
	 * 
	 * @param googlePlayPublicKey
	 *              string - The base64 encoded public key that you can find at Google Play Publisher Site.
	 * 
	 * @param samsungGroupId
	 *              string - The IAP Group ID that you obtained from Samsung Developer Site.
	 * 
	 * @param testMode
	 *              bool - If true, test mode is enabled. (Currently only valid for Samsung Apps Store).
	 * 
	 * @param showSpinnerWhenNecessary
	 *              bool - True for showing a spinner while a transaction is in process (If necessary).
	 * 
	 * @param skusConsumable
	 *              string[] - A set of Consumable product IDs you want the plugin to automatically 
	 *                         retrieve information for you.
	 * 
	 * @param skusNonConsumable
	 *              string[] - A set of Non-consumable product IDs you want the plugin to automatically 
	 *                         retrieve information for you.
	 * 
	 * @param skusSubscription
	 *              string[] - A set of Subscription product IDs you want the plugin to automatically 
	 *                         retrieve information for you.
	 * 
	 * @param samsungSkusMap
	 *              string[] - A set of samsungItemID-to-Sku map, to leave your "Purchase()" code unchanged while
	 *                         handling Samsung item purchases. As you may know, samsung has a different naming
	 *                         convention - a numeric ID for each item but not the form that Google, Amazon and 
	 *                         Apple provides. You can fill the "map" in one item of the filed, for instance:
	 * 	                       "000001000018:com.your.item.sku". (Note the ":" is the delimiter)
	 * 
	 * @param showSamsungInitSpinner
	 *              bool - If true, a spinner indicating the IAP init progress will be shown, flase for not.
	 * 
	 * @param verifyReceiptFromDevice
	 *              bool - True for verifying receipt from the user device once the 
	 *                     purchase is "completed". If the verification succeeds, 
	 *                     SmartIAPListener::OnPurchaseCompleted() will be triggered,
	 *                     but if the receipt is invalid, SmartIAPListener::OnPurchaseFailed()
	 *                     will be triggered.
	 * 
	 * @param serverReceiveReceiptURL
	 *              string - Setting a valid URL on your own server enables posting the
	 *                       StoreKit Receipt to your server, for further server-to-server 
	 *                       verification and other server-side processes you need.
	 *                       e.g. creating subscirption entries, preparing downloadable 
	 *                       content, etc...
	 * 
	 */
	public void Initialize(SmartIAPStoreSelection store, string googlePlayPublicKey, string samsungGroupId, 
	                       bool testMode, bool showSpinnerWhenNecessary, string[] skusConsumable, 
			               string[] skusNonConsumable, string[] skusSubscription, string[] samsungSkusMap,
	                       bool showSamsungInitSpinner, bool verifyReceiptFromDevice, string serverReceiveReceiptURL)
	{
#if UNITY_ANDROID		
		SmartIAPAndroid.Instance().Initialize(store, googlePlayPublicKey, samsungGroupId, testMode, 
		                                      showSpinnerWhenNecessary, skusConsumable, skusNonConsumable, 
		                                      skusSubscription, samsungSkusMap, showSamsungInitSpinner,
		                                      verifyReceiptFromDevice, serverReceiveReceiptURL);
#endif	
#if UNITY_IPHONE
		SmartIAPIOS.Instance().Initialize(store, googlePlayPublicKey, samsungGroupId, testMode, 
		                                      showSpinnerWhenNecessary, skusConsumable, skusNonConsumable, 
		                                      skusSubscription, samsungSkusMap, showSamsungInitSpinner,
		                                  	  verifyReceiptFromDevice, serverReceiveReceiptURL);		
#endif		
	}	
	
	/**
	 * Initiate an in-app purchase request to the plugin.
	 * 
	 * @param sku
	 *           string - IAP item identifier, the Product ID you defined at IAP Provider's publisher site.
	 * 	
	 * 	
	 */
	public void Purchase(string sku)
	{
#if UNITY_ANDROID		
		SmartIAPAndroid.Instance().Purchase(sku, null, null);
#endif
#if UNITY_IPHONE		
		SmartIAPIOS.Instance().Purchase(sku, null, null);
#endif		
	}
	
	/**
	 * Initiate an in-app purchase request to the plugin.
	 * 
	 * @param sku
	 *           string - IAP item identifier, the Product ID you defined at IAP Provider's publisher site.
	 * 	
	 * 
	 * @param payload
	 *          string -  a developer payload that is associated with a given purchase, 
	 *          if null, no payload is sent.Developer Payload is a developer-specified 
	 *          string that contains supplemental information about a purchase. 	 
	 */
	public void Purchase(string sku, string payload)
	{
#if UNITY_ANDROID		
		SmartIAPAndroid.Instance().Purchase(sku, payload, null);
#endif	
#if UNITY_IPHONE		
		SmartIAPIOS.Instance().Purchase(sku, payload, null);
#endif		
	}
	
	/**
	 * Initiate an in-app purchase request to the plugin.
	 * 
	 * @param sku
	 *           string - IAP item identifier, the Product ID you defined at IAP Provider's publisher site.
	 * 	
	 * 
	 * @param payload
	 *          string -  a developer payload that is associated with a given purchase, 
	 *          if null, no payload is sent.Developer Payload is a developer-specified 
	 *          string that contains supplemental information about a purchase.
	 *
	 * @param extras
	 *          Dictionary - The extra parameters you want to post the receipt along with. 
	 *                       extras is particularly useful when you want to send your customized
	 *                       data to your server along with the receipt for server-to-server
	 *                       verification. For instance, you can put in the user ID or device ID
	 *                       for further associating the purchase with the user.
	 */
	public void Purchase(string sku, string payload, Dictionary<string, string> extras)
	{
#if UNITY_ANDROID		
		SmartIAPAndroid.Instance().Purchase(sku, payload, extras);
#endif	
#if UNITY_IPHONE		
		SmartIAPIOS.Instance().Purchase(sku, payload, extras);
#endif		
	}	
	
	/**
	 * Get the specified item information.
	 * 
	 * The item information is retrieved at app launch and it is cached in plugin for better performance.
	 * You should always call this function in SmartIAPListener::OnItemDataReady() to make sure the data
	 * has been ready for you to query.
	 * 
	 * @param sku
	 * 			string - IAP item identifier, the sku you defined at IAP Provider's publisher site.
	 * 
	 * @return 
	 * 			SmartIAPItem - A Google IAB Item which contains { title, description, price, type }
	 */
	public SmartIAPItem GetItemInfo(string sku)
	{
		SmartIAPItem item = null;		
		
#if UNITY_ANDROID		
		item = SmartIAPAndroid.Instance().GetItemInfo(sku);
#endif
#if UNITY_IPHONE		
		item = SmartIAPIOS.Instance().GetItemInfo(sku);
#endif		
		
		return item;
	}	
	
	/**
	 * Get the price of specified item.
	 * 
	 * The item information is retrieved at app launch and it is cached in plugin for better performance.
	 * You should always call this function in SmartIAPListener::OnItemDataReady() to make sure the data
	 * has been ready for you to query.
	 * 
	 * @param sku
	 * 			string - IAP item identifier, the sku you defined at IAP Provider's publisher site.
	 * 
	 * @return 
	 * 			float - The price of the item
	 */	
	public float GetItemPrice(string sku)
	{		
		float price = 0.0f;
		
#if UNITY_ANDROID		
		price = SmartIAPAndroid.Instance().GetItemPrice(sku);
#endif
#if UNITY_IPHONE		
		price = SmartIAPIOS.Instance().GetItemPrice(sku);
#endif		
		
		return price;		
	}
	
	/**
	 * Restore completed transactions.
	 * 
	 * This is useful when your locally saved purchase records are somehow wiped out on the device,
	 * in this case you may want to redeliver the purchased Non-consumable products if any.
	 * 
	 * NOTE: (iOS) Since Apple requires the user to authenticate before restoring completed transactions,
	 * this task cannot be done automatically when App starts. You would need to add a button named
	 * "Restore Completed Transactions", to provide the user with a way to restore his / her original 
	 * purchases.
	 * 
	 */
	public void RestoreCompletedTransactions()
	{
#if UNITY_ANDROID		
		SmartIAPAndroid.Instance().RestoreCompletedTransactions();
#endif		
#if UNITY_IPHONE		
		SmartIAPIOS.Instance().RestoreCompletedTransactions();
#endif
	}	
	
	/**
	 * Refresh the items information.	
	 * 
	 * @param skusConsumable
	 *              string[] - A set of Consumable product IDs you want the plugin to automatically 
	 *                         retrieve information for you.
	 * 
	 * @param skusNonConsumable
	 *              string[] - A set of Non-consumable product IDs you want the plugin to automatically 
	 *                         retrieve information for you.
	 * 
	 * @param skusSubscription
	 *              string[] - A set of Subscription product IDs you want the plugin to automatically 
	 *                         retrieve information for you.
	 * 
	 * @param samsungSkusMap
	 *              string[] - A set of samsungItemID-to-Sku map, to leave your "Purchase()" code unchanged while
	 *                         handling Samsung item purchases. As you may know, samsung has a different naming
	 *                         convention - a numeric ID for each item but not the form that Google, Amazon and 
	 *                         Apple provides. You can fill the "map" in one item of the filed, for instance:
	 * 	                       "000001000018:com.your.item.sku". (Note the ":" is the delimiter)
	 */
	public void RefreshItems(string[] skusConsumable, string[] skusNonConsumable, 
	                         string[] skusSubscription, string[] samsungSkusMap)
	{
#if UNITY_ANDROID		
		SmartIAPAndroid.Instance().RefreshItems(skusConsumable, skusNonConsumable, 
		                                        skusSubscription, samsungSkusMap);
#endif		
#if UNITY_IPHONE		
		SmartIAPIOS.Instance().RefreshItems(skusConsumable, skusNonConsumable, 
		                                        skusSubscription, samsungSkusMap);
#endif		
	}
	
	#endregion
}
