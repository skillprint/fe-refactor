using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.IO;

public static class FloodFiller  {
	public static Color tarGetCol;
	public struct Point
	{
		public short x;
		public short y;
		public Point(short aX, short aY) { x = aX; y = aY; }
		public Point(int aX, int aY) : this((short)aX, (short)aY) { }
	}
	// Use this for initialization
	public static void RevisedQueueFloodFill(Texture2D targetTex,int hitX,int hitY, Color replaceColor,bool dontPush)
	{

		Color32[] pixels = targetTex.GetPixels32 ();// store image colors
		int w = targetTex.width;
		int h = targetTex.height;
		Color targetColor = pixels[hitX+hitY*w];
		tarGetCol = targetColor;
		if (targetColor == replaceColor) return;	
		Queue<Point> q = new Queue<Point>();
		q.Enqueue(new Point(hitX,hitY));// add hit point to queue
		Point n, t, u;
		while (q.Count > 0)
		{
			n = q.Dequeue();
			if (pixels[n.x+n.y*w] == targetColor&&pixels[n.x+ n.y*w] != Color.black)
			{
				
				t = n;
				while ((t.x > 0) && (pixels[t.x+ t.y*w] == targetColor)&&(pixels[t.x+ t.y*w] != Color.black))//check whether point in context is within bounds and does not match new fill color or border color
				{
					pixels[t.x+ t.y*w] = replaceColor; // change color of reference point to replaced color
					t.x--;
				}
				int XMin = t.x + 1;
								
				t = n;
				t.x++;
				while ((t.x < w - 1) &&
				       (pixels[t.x+ t.y*w] == targetColor)&&(pixels[t.x+ t.y*w] != Color.black))//check whether point in context is within bounds and does not match new fill color or border color
				{
					pixels[t.x+ t.y*w] = replaceColor;// change color of reference point to replaced color
					t.x++;
				}

				int XMax = t.x - 1;
				t = n;
				t.y++;
				
				u = n;
				u.y--;
				
				for ( int i = XMin; i <= XMax; i++)
				{
					t.x =(short) i;
					u.x = (short)i;
					//DFS to check if point does not match replace color
					if ((t.y <h- 1) &&
					    (pixels[t.x+ t.y*w] == targetColor)) q.Enqueue(t);
					
					if ((u.y >= 0) &&
					    (pixels[u.x+ u.y*w] == targetColor)) q.Enqueue(u);
				}
			}
		}
		targetTex.SetPixels32 (pixels);

	}
}
