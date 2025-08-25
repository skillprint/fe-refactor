using UnityEngine;
using System.Collections;
using System.Collections.Generic;
public class Category:ScriptableObject
{
	public string CategoryName;
	public Texture2D mainImage;
//	public List<ImageAsset> images;
	public ImageAssetList images;//,subCategoryImages;
	//	public bool hasSubCategory;
}
