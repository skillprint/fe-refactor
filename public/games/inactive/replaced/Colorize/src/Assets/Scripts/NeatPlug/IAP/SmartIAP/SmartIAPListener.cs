/**
 * SmartIAPListener.cs
 * 
 * SmartIAPListener listens to the Google In-App Billing events.
 * File location: Assets/Scripts/NeatPlug/IAP/SmartIAP/SmartIAPListener.cs
 * 
 * Please read the code comments carefully, or visit 
 * http://www.neatplug.com/integration-guide-unity3d-smart-iap-plugin to find information 
 * about how to integrate and use this program.
 * 
 * End User License Agreement: http://www.neatplug.com/eula
 * 
 * (c) Copyright 2013 NeatPlug.com All Rights Reserved.
 * 
 * @version 1.2.9
 * @google_iab_api v3 
 * @amazon_iap_api v1.0.3
 * @samsung_iap_api v2
 *
 */

using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class SmartIAPListener : MonoBehaviour {
	
	// Debug information printing switch, turn it off in production environment.
	private bool _debug = true;
	
	private static bool _instanceFound = false;

	void Awake()
	{
		// Do not modify the codes below.
		if (_instanceFound)
		{
			Destroy(gameObject);
			return;
		}
		_instanceFound = true;		
		DontDestroyOnLoad(this);
		SmartIAP.Instance();		
	}
	
	void OnEnable()
	{
		// Register the IAP events.
		// Do not modify the codes below.		

		SmartIAPAgent.OnBillingSupported += OnBillingSupported;
		SmartIAPAgent.OnSubscriptionSupported += OnSubscriptionSupported;		
		SmartIAPAgent.OnItemDataReady += OnItemDataReady;
		SmartIAPAgent.OnItemDataFailed += OnItemDataFailed;
		SmartIAPAgent.OnOwnedItemReported += OnOwnedItemReported;		
		SmartIAPAgent.OnPurchaseCompleted += OnPurchaseCompleted;
		SmartIAPAgent.OnPurchaseFailed += OnPurchaseFailed;
		SmartIAPAgent.OnPurchaseCancelled += OnPurchaseCancelled;		
		SmartIAPAgent.OnItemAlreadyOwned += OnItemAlreadyOwned;
		SmartIAPAgent.OnPurchaseCancelledByStore += OnPurchaseCancelledByStore;		
		SmartIAPAgent.OnReceiptPosted += OnReceiptPosted;
		SmartIAPAgent.OnFailedToPostReceipt += OnFailedToPostReceipt;
		SmartIAPAgent.OnStoreDetected += OnStoreDetected;
		SmartIAPAgent.OnCompletedTransactionsRestored += OnCompletedTransactionsRestored;
		SmartIAPAgent.OnCompletedTransactionsFailedToRestore += OnCompletedTransactionsFailedToRestore;
	}

	void OnDisable()
	{
		// Unregister the IAP events.
		// Do not modify the codes below.		
		SmartIAPAgent.OnBillingSupported -= OnBillingSupported;
		SmartIAPAgent.OnSubscriptionSupported -= OnSubscriptionSupported;		
		SmartIAPAgent.OnItemDataReady -= OnItemDataReady;		
		SmartIAPAgent.OnItemDataFailed -= OnItemDataFailed;
		SmartIAPAgent.OnOwnedItemReported -= OnOwnedItemReported;		
		SmartIAPAgent.OnPurchaseCompleted -= OnPurchaseCompleted;
		SmartIAPAgent.OnPurchaseFailed -= OnPurchaseFailed;
		SmartIAPAgent.OnPurchaseCancelled -= OnPurchaseCancelled;		
		SmartIAPAgent.OnItemAlreadyOwned -= OnItemAlreadyOwned;
		SmartIAPAgent.OnPurchaseCancelledByStore -= OnPurchaseCancelledByStore;		
		SmartIAPAgent.OnReceiptPosted -= OnReceiptPosted;
		SmartIAPAgent.OnFailedToPostReceipt -= OnFailedToPostReceipt;
		SmartIAPAgent.OnStoreDetected -= OnStoreDetected;
		SmartIAPAgent.OnCompletedTransactionsRestored -= OnCompletedTransactionsRestored;
		SmartIAPAgent.OnCompletedTransactionsFailedToRestore -= OnCompletedTransactionsFailedToRestore;
	}
	
	/**
	 * Fired when the check for the In-App Billing support is done.	
	 */
	void OnBillingSupported(bool supported, string response)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnBillingSupported: supported -> " + supported.ToString() + ", response -> " + response);
		
		/// Your code here...
	}
		
	/**
	 * Fired when the check for subcription support is done.	
	 *
	 * @param supported
	 *             bool - true for supported, false for unsupported.
	 * 
	 * @param response
	 *             string - The response code returned from Google IAB API.
	 */
	void OnSubscriptionSupported(bool supported, string response)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnSubscriptionSupported: supported -> " + supported.ToString() + ", response -> " + response);	
		
		/// Your code here...
	}
	
	/**
	 * Fired when the store detection completed.
	 * 
	 * This is an informational event that let you know the auto-detected 
	 * source store from where your App is installed.
	 * 
	 * @param store
	 *          SmartIAPStoreType - The detected store type.
	 * 
	 */
	void OnStoreDetected(SmartIAPStoreType store)
	{
		if (_debug)
		{
			Debug.Log (this.GetType().ToString() + " - OnStoreDetected Fired. Detected Store -> " + store.ToString());					
		}		
		/// Your code here...
	}	
	
	/**
	 * Fired when the item data is ready to query.
	 * Do your item query then if you need.
	 */
	void OnItemDataReady()
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnItemDataReady() Fired.");
		
		/// Your code here... (Sample codes provided below)
		
		/*************************************************************
		  BEGIN CODE SAMPLE : Sample of getting item information.
		 *************************************************************
		 
		// Get item info:
		SmartIAPItem iapItem = SmartIAP.Instance().GetItemInfo("your_item_sku");		
		Debug.Log ("iapItem.description: " + iapItem.description);
		Debug.Log ("iapItem.price: " + iapItem.price);
		Debug.Log ("iapItem.currency: " + iapItem.currency);
		Debug.Log ("iapItem.formmatedPrice: " + iapItem.formattedPrice);
		Debug.Log ("iapItem.title: " + iapItem.title);
		Debug.Log ("iapItem.type: " + iapItem.type);			
		
		// Get item price:
		float itemPrice = SmartIAP.Instance().GetItemPrice("your_item_sku");
		Debug.Log ("itemPrice: " + itemPrice);		
		
		*************************************************************
		 END CODE SAMPLE : Sample of getting item information.
		*************************************************************/
	}	
	
	/**
	 * Fired when failed to query item data.
	 * 
	 * @param err
	 *         string - The error code returned.
	 */
	void OnItemDataFailed(string err)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnItemDataFailed Fired. Err -> " + err);	
		
		/// Your code here...
	}
	
	/**
	 * Fired when receiving an owned item report event.
	 * 
	 * This indicates that the item type is "NonConsumable" and the user has already 
	 * owned the item. By default the plugin gets notified with the event every time your 
	 * app launches, it is suggested that you should redeliver the item to the user here 
	 * if the locally saved data record cannot be found. (Probably the user cleared the 
	 * PlayerPrefs data or a new device is being used) 
	 * 
	 * @param sku
	 *           string - IAP item identifier, the sku you defined at Google Play's publisher site.	
	 */	
	void OnOwnedItemReported(string sku)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnOwnedItemReported(" + sku + ") Fired.");
		
		/// This is the best place to re-deliver the NonConsumable item if you cannot 
		/// find the locally saved data records saying the item has been delivered.	
		
		/// Your code here...
	}		
	
	/**
	 * Fired when the purchase successfully completed.	
	 * 
	 * This is where you should deliver the item to the user.
	 * 
	 * @param receipt
	 *           SmartIAPReceipt - An object which contains the purchase information. 
	 *                             { sku, purchaseTime, orderId, purchaseToken,
	 *                               purchaseState, packageName, developerPayload, data }
	 *                             NOTE: "data" is a JSON string that contains the receipt data
	 *                             returned from the store, you may want to use it to do your own
	 *                             receipt posting if you don't want the plugin to automatically
	 *                             do it for you.
	 *        
	 */
	void OnPurchaseCompleted(SmartIAPReceipt receipt)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnPurchaseCompleted Fired.\n"
			    + "{\n" 
				+ "  sku -> " + receipt.sku + ", \n" 
				+ "  purchaseTime -> " + receipt.purchaseTime.ToString() + ", \n"		
				+ "  orderId -> " + receipt.orderId + ", \n"
			    + "  purchaseToken -> " + receipt.purchaseToken + ", \n"
			    + "  purchaseState -> " + receipt.purchaseState + ", \n"
			    + "  packageName -> " + receipt.packageName + ", \n"
			    + "  originalJson -> " + receipt.originalJson + ", \n"    
			    + "  developerPayload -> " + receipt.developerPayload + ", \n"        
				+ "  data -> " + receipt.data + "\n"
			    + "}\n"
			);
		List<string> SKUs = new List<string> ();
		SKUs = ImagePathHolder.GetSKUs ();
		if (receipt.sku.Contains(SKUs[0]))
		{
			ImagePathHolder.UnlockCategories();

		}
		if(receipt.sku==SKUs[1])
			ImagePathHolder.SetLockedColors ();
		if (receipt.sku ==SKUs[2]) 
		{
			ImagePathHolder.UnlockCategories();
			ImagePathHolder.SetLockedColors ();
		}
		/// Your code here...
	}	
	
	/**
	 * Fired when the purchase failed.
	 * 		 
	 * @param sku
	 *           string - IAP item identifier, the Product ID you defined at Google Play's publisher site.	
	 * 
	 * @param err
	 *           string - The reason for failure.
	 */	
	void OnPurchaseFailed(string sku, string err)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnPurchaseFailed Fired. sku -> " + sku + ", err -> " + err);	
		
		/// Your code here...		
	}	
	
	/**
	 * Fired when the purchase cancelled by the user.
	 * 		 
	 * @param sku
	 *           string - IAP item identifier, the Product ID you defined at Google Play's publisher site.
	 */	
	void OnPurchaseCancelled(string sku)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnPurchaseCancelled Fired. sku -> " + sku);	
		
		/// Your code here...			
	}
	
	/**
	 * Fired if the user has already owned this NonConsumable item when a corresponding
	 * purchase is attempted.
	 *
	 * This indicates that the item type is "NonConsumable" and the user has already owned
	 * the item. This event is only triggered in case you ignored the default automatic
	 * owned item reporting happened in OnOwnedItemReported() at app launches, but 
	 * you are not suggested to do so since requiring the user who has already purchased 
	 * the NonConsumable item to perform the purchase again, and tell the user "You have already
	 * owned the item", is obviously causing confusion.
	 *
	 * In most cases you should only play with the "OnOwnedItemReported()" event.
	 * But you can use this where you really need it to be that way.
	 *
	 * @param sku
	 *           string - IAP item identifier, the sku you defined at Google Play's publisher site.	
	 */	
	void OnItemAlreadyOwned(string sku)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnItemAlreadyOwned(" + sku + ") Fired.");		
		
		/// Your code here...
	}	
	
	/**
	 * Fired when the purchase cancelled by Google.
	 * 	
	 * The cancellation is primarily caused by user's credit card validation failure.
	 * 
	 * @param sku
	 *           string - IAP item identifier, the sku you defined at Google Play's publisher site.
	 */		
	void OnPurchaseCancelledByStore(string sku)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnPurchaseCancelledByStore: sku -> " + sku);	
		
		/// Your code here...			
	}
	
	/**
	 * Fired when the receipt is successfully posted to server.
	 * 
	 * @param response
	 *           string - The response from your server.
	 * 	
	 */	
	void OnReceiptPosted(string response)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnReceiptPosted Fired. Server Response: " + response);		
		
		/// Your code here...
	}
	
	/**
	 * Fired when the receipt data failed to be posted.
	 * 
	 * @param err
	 *           string - The error string.	
	 * 	 
	 */
	void OnFailedToPostReceipt(string err)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnFailedToPostReceipt Fired. Err: " + err);		
		
		/// Your code here...
	}	
	
	/**
	 * Fired when the completed transactions are successfully restored.
	 * 
	 * NOTE: This event gets triggered only if you call 
	 * SmartIAP.Instance().RestoreCompletedTransactions().
	 * This event is for informational purpose only, you may want to
	 * inform the user of the restore completion here.
	 * 
	 * If there are any purchased Non-Consumable products, 
	 * then SmartIAPListener::OnOwnedItemReported() will be triggered, 
	 * you can redeliver the products to the user in that event handler.	
	 */
	void OnCompletedTransactionsRestored()
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnCompletedTransactionsRestored() Fired.");
	}
	
	/**
	 * Fired when the completed transactions failed to restore.	
	 * 
	 * @param err
	 *           string - The error message returned from Apple.
	 */	
	void OnCompletedTransactionsFailedToRestore(string err)
	{
		if (_debug)
			Debug.Log (this.GetType().ToString() + " - OnCompletedTransactionsFailedToRestore Fired. err -> " + err);	
		
		/// Your code here...		
	}	
	
}
