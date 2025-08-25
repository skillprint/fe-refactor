////////////////////////////////////////////////////////////
// GAME LEVELS
////////////////////////////////////////////////////////////

var levels_arr = [
					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:1, start:{r:3, c:0}, end:{r:1, c:2}},
							{index:0, start:{r:3, c:1}, end:{r:4, c:4}},
							{index:2, start:{r:1, c:1}, end:{r:0, c:3}},
							{index:3, start:{r:4, c:0}, end:{r:4, c:2}},
							{index:4, start:{r:0, c:4}, end:{r:3, c:4}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:0}, end:{r:4, c:1}},
							{index:1, start:{r:3, c:1}, end:{r:0, c:2}},
							{index:2, start:{r:1, c:2}, end:{r:4, c:2}},
							{index:3, start:{r:3, c:3}, end:{r:0, c:4}},
							{index:4, start:{r:1, c:4}, end:{r:4, c:3}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:3, c:0}, end:{r:0, c:1}},
							{index:1, start:{r:4, c:0}, end:{r:0, c:2}},
							{index:2, start:{r:1, c:3}, end:{r:2, c:2}},
							{index:3, start:{r:3, c:3}, end:{r:4, c:2}},
							{index:4, start:{r:0, c:3}, end:{r:4, c:3}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:1, c:0}, end:{r:0, c:3}},
							{index:1, start:{r:0, c:4}, end:{r:4, c:0}},
							{index:2, start:{r:2, c:2}, end:{r:4, c:2}},
							{index:3, start:{r:4, c:1}, end:{r:3, c:3}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:0}, end:{r:4, c:4}},
							{index:1, start:{r:3, c:1}, end:{r:0, c:2}},
							{index:2, start:{r:0, c:3}, end:{r:3, c:4}},
							{index:4, start:{r:0, c:4}, end:{r:2, c:3}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:3, c:1}, end:{r:0, c:3}},
							{index:1, start:{r:0, c:0}, end:{r:4, c:1}},
							{index:2, start:{r:3, c:2}, end:{r:0, c:4}},
							{index:3, start:{r:1, c:3}, end:{r:2, c:2}},
							{index:4, start:{r:3, c:4}, end:{r:4, c:2}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:3}, end:{r:4, c:2}},
							{index:1, start:{r:4, c:0}, end:{r:1, c:2}},
							{index:2, start:{r:1, c:1}, end:{r:2, c:2}},
							{index:4, start:{r:1, c:3}, end:{r:4, c:1}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:2, c:0}, end:{r:0, c:3}},
							{index:1, start:{r:1, c:2}, end:{r:3, c:1}},
							{index:2, start:{r:3, c:3}, end:{r:4, c:4}},
							{index:3, start:{r:3, c:0}, end:{r:3, c:4}},
							{index:4, start:{r:0, c:4}, end:{r:1, c:3}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:2, c:0}, end:{r:4, c:3}},
							{index:1, start:{r:2, c:3}, end:{r:4, c:4}},
							{index:2, start:{r:2, c:2}, end:{r:0, c:4}},
							{index:3, start:{r:0, c:1}, end:{r:0, c:3}},
							{index:4, start:{r:0, c:0}, end:{r:3, c:3}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:0}, end:{r:3, c:2}},
							{index:1, start:{r:1, c:0}, end:{r:0, c:4}},
							{index:2, start:{r:0, c:2}, end:{r:2, c:2}},
							{index:4, start:{r:0, c:3}, end:{r:3, c:3}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:4, c:0}, end:{r:4, c:2}},
							{index:1, start:{r:3, c:4}, end:{r:0, c:4}},
							{index:2, start:{r:2, c:3}, end:{r:4, c:4}},
							{index:3, start:{r:3, c:2}, end:{r:0, c:2}},
							{index:4, start:{r:1, c:1}, end:{r:0, c:3}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:2, c:0}, end:{r:0, c:1}},
							{index:1, start:{r:2, c:2}, end:{r:1, c:3}},
							{index:2, start:{r:1, c:1}, end:{r:3, c:2}},
							{index:3, start:{r:2, c:1}, end:{r:4, c:0}},
							{index:4, start:{r:4, c:1}, end:{r:4, c:4}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:2, c:0}, end:{r:3, c:3}},
							{index:1, start:{r:1, c:0}, end:{r:3, c:1}},
							{index:2, start:{r:3, c:4}, end:{r:4, c:3}},
							{index:4, start:{r:1, c:1}, end:{r:1, c:3}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:4}, end:{r:0, c:0}},
							{index:1, start:{r:2, c:1}, end:{r:4, c:4}},
							{index:2, start:{r:2, c:2}, end:{r:3, c:4}},
							{index:4, start:{r:4, c:2}, end:{r:1, c:4}},
]
					},

					{
						row:5,
						column:5,
						size:110,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:1}, end:{r:0, c:4}},
							{index:1, start:{r:4, c:0}, end:{r:3, c:3}},
							{index:2, start:{r:3, c:4}, end:{r:4, c:2}},
							{index:3, start:{r:3, c:0}, end:{r:2, c:3}},
							{index:4, start:{r:0, c:0}, end:{r:2, c:4}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:3, c:2}, end:{r:0, c:4}},
							{index:1, start:{r:5, c:2}, end:{r:0, c:5}},
							{index:2, start:{r:4, c:2}, end:{r:1, c:4}},
							{index:3, start:{r:5, c:0}, end:{r:0, c:1}},
							{index:4, start:{r:0, c:0}, end:{r:4, c:0}},
							{index:5, start:{r:0, c:2}, end:{r:2, c:2}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:4, c:1}, end:{r:2, c:3}},
							{index:1, start:{r:0, c:2}, end:{r:3, c:5}},
							{index:2, start:{r:0, c:1}, end:{r:4, c:5}},
							{index:3, start:{r:2, c:2}, end:{r:4, c:2}},
							{index:4, start:{r:2, c:5}, end:{r:0, c:5}},
							{index:5, start:{r:3, c:3}, end:{r:4, c:4}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:2, c:3}, end:{r:5, c:3}},
							{index:1, start:{r:5, c:2}, end:{r:4, c:3}},
							{index:2, start:{r:1, c:1}, end:{r:4, c:2}},
							{index:3, start:{r:4, c:4}, end:{r:1, c:4}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:2}, end:{r:1, c:4}},
							{index:1, start:{r:1, c:1}, end:{r:4, c:3}},
							{index:2, start:{r:1, c:3}, end:{r:5, c:5}},
							{index:3, start:{r:3, c:2}, end:{r:0, c:1}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:4, c:4}, end:{r:2, c:3}},
							{index:1, start:{r:4, c:1}, end:{r:3, c:4}},
							{index:2, start:{r:2, c:0}, end:{r:2, c:4}},
							{index:4, start:{r:1, c:0}, end:{r:5, c:5}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:5, c:0}, end:{r:3, c:2}},
							{index:1, start:{r:1, c:1}, end:{r:3, c:5}},
							{index:2, start:{r:4, c:2}, end:{r:3, c:4}},
							{index:3, start:{r:2, c:5}, end:{r:0, c:5}},
							{index:4, start:{r:3, c:3}, end:{r:1, c:3}},
							{index:5, start:{r:2, c:4}, end:{r:0, c:3}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:4, c:0}, end:{r:2, c:5}},
							{index:1, start:{r:2, c:3}, end:{r:0, c:2}},
							{index:2, start:{r:0, c:3}, end:{r:1, c:5}},
							{index:3, start:{r:1, c:1}, end:{r:3, c:2}},
							{index:4, start:{r:1, c:2}, end:{r:4, c:4}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:1, c:2}, end:{r:4, c:1}},
							{index:1, start:{r:4, c:4}, end:{r:0, c:4}},
							{index:2, start:{r:2, c:2}, end:{r:5, c:1}},
							{index:3, start:{r:3, c:2}, end:{r:5, c:2}},
							{index:4, start:{r:3, c:3}, end:{r:0, c:5}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:0}, end:{r:2, c:5}},
							{index:1, start:{r:4, c:1}, end:{r:4, c:5}},
							{index:2, start:{r:3, c:1}, end:{r:3, c:5}},
							{index:3, start:{r:2, c:0}, end:{r:5, c:5}},
							{index:4, start:{r:1, c:5}, end:{r:1, c:2}},
							{index:5, start:{r:0, c:1}, end:{r:0, c:5}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:0}, end:{r:1, c:5}},
							{index:1, start:{r:1, c:4}, end:{r:4, c:4}},
							{index:2, start:{r:4, c:2}, end:{r:1, c:3}},
							{index:3, start:{r:2, c:3}, end:{r:4, c:1}},
							{index:4, start:{r:3, c:2}, end:{r:2, c:5}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:1, c:2}, end:{r:2, c:5}},
							{index:1, start:{r:0, c:2}, end:{r:2, c:0}},
							{index:2, start:{r:5, c:0}, end:{r:4, c:1}},
							{index:3, start:{r:4, c:0}, end:{r:1, c:4}},
							{index:4, start:{r:1, c:1}, end:{r:4, c:4}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:5, c:3}, end:{r:3, c:3}},
							{index:1, start:{r:1, c:4}, end:{r:5, c:5}},
							{index:2, start:{r:4, c:5}, end:{r:0, c:4}},
							{index:3, start:{r:5, c:0}, end:{r:5, c:2}},
							{index:4, start:{r:5, c:1}, end:{r:1, c:2}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:4, c:1}, end:{r:3, c:3}},
							{index:1, start:{r:4, c:4}, end:{r:2, c:4}},
							{index:2, start:{r:3, c:1}, end:{r:2, c:3}},
							{index:3, start:{r:5, c:0}, end:{r:0, c:3}},
							{index:4, start:{r:1, c:0}, end:{r:0, c:2}},
							{index:5, start:{r:4, c:0}, end:{r:1, c:4}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:5}, end:{r:1, c:1}},
							{index:1, start:{r:1, c:3}, end:{r:5, c:4}},
							{index:2, start:{r:4, c:0}, end:{r:2, c:3}},
							{index:3, start:{r:4, c:2}, end:{r:0, c:1}},
							{index:4, start:{r:2, c:1}, end:{r:3, c:2}},
							{index:5, start:{r:2, c:4}, end:{r:4, c:4}},
]
					},

					{
						row:6,
						column:6,
						size:90,
						invicible:[],
						pipes:[
							{index:0, start:{r:2, c:1}, end:{r:2, c:3}},
							{index:1, start:{r:4, c:2}, end:{r:4, c:4}},
							{index:2, start:{r:5, c:0}, end:{r:0, c:5}},
							{index:3, start:{r:1, c:5}, end:{r:5, c:3}},
							{index:4, start:{r:5, c:2}, end:{r:1, c:1}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:2}, end:{r:6, c:3}},
							{index:1, start:{r:1, c:2}, end:{r:5, c:2}},
							{index:2, start:{r:3, c:2}, end:{r:4, c:4}},
							{index:3, start:{r:1, c:3}, end:{r:1, c:5}},
							{index:4, start:{r:2, c:2}, end:{r:3, c:5}},
							{index:5, start:{r:6, c:2}, end:{r:0, c:1}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:6, c:0}, end:{r:1, c:0}},
							{index:1, start:{r:5, c:0}, end:{r:5, c:5}},
							{index:2, start:{r:5, c:4}, end:{r:4, c:2}},
							{index:3, start:{r:5, c:1}, end:{r:4, c:4}},
							{index:4, start:{r:3, c:4}, end:{r:2, c:2}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:0}, end:{r:6, c:1}},
							{index:1, start:{r:3, c:1}, end:{r:6, c:6}},
							{index:2, start:{r:2, c:1}, end:{r:4, c:2}},
							{index:3, start:{r:2, c:3}, end:{r:0, c:2}},
							{index:4, start:{r:0, c:1}, end:{r:3, c:4}},
							{index:5, start:{r:4, c:4}, end:{r:1, c:5}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:4, c:0}, end:{r:5, c:6}},
							{index:1, start:{r:4, c:1}, end:{r:3, c:5}},
							{index:2, start:{r:4, c:2}, end:{r:1, c:4}},
							{index:3, start:{r:2, c:5}, end:{r:4, c:6}},
							{index:4, start:{r:3, c:0}, end:{r:1, c:1}},
							{index:5, start:{r:2, c:2}, end:{r:0, c:5}},
							{index:6, start:{r:1, c:5}, end:{r:0, c:6}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:1, c:0}, end:{r:2, c:1}},
							{index:1, start:{r:1, c:1}, end:{r:1, c:5}},
							{index:2, start:{r:2, c:0}, end:{r:4, c:2}},
							{index:3, start:{r:3, c:1}, end:{r:3, c:3}},
							{index:4, start:{r:4, c:1}, end:{r:4, c:5}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:5, c:3}, end:{r:6, c:6}},
							{index:1, start:{r:4, c:3}, end:{r:4, c:6}},
							{index:2, start:{r:3, c:3}, end:{r:3, c:6}},
							{index:3, start:{r:0, c:4}, end:{r:6, c:5}},
							{index:4, start:{r:5, c:2}, end:{r:3, c:2}},
							{index:5, start:{r:5, c:1}, end:{r:1, c:6}},
							{index:6, start:{r:1, c:1}, end:{r:0, c:6}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:6}, end:{r:3, c:6}},
							{index:1, start:{r:2, c:6}, end:{r:2, c:4}},
							{index:2, start:{r:4, c:6}, end:{r:1, c:1}},
							{index:3, start:{r:3, c:1}, end:{r:5, c:5}},
							{index:4, start:{r:1, c:0}, end:{r:0, c:5}},
							{index:5, start:{r:4, c:5}, end:{r:1, c:2}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:3, c:0}, end:{r:6, c:0}},
							{index:1, start:{r:6, c:6}, end:{r:2, c:2}},
							{index:2, start:{r:2, c:3}, end:{r:2, c:0}},
							{index:3, start:{r:3, c:1}, end:{r:6, c:1}},
							{index:4, start:{r:6, c:2}, end:{r:5, c:5}},
							{index:5, start:{r:4, c:3}, end:{r:3, c:6}},
							{index:6, start:{r:2, c:1}, end:{r:1, c:5}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:4, c:0}, end:{r:5, c:6}},
							{index:1, start:{r:4, c:6}, end:{r:0, c:5}},
							{index:2, start:{r:1, c:1}, end:{r:1, c:5}},
							{index:3, start:{r:0, c:6}, end:{r:3, c:6}},
							{index:4, start:{r:2, c:4}, end:{r:3, c:3}},
							{index:5, start:{r:1, c:4}, end:{r:1, c:2}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:1, c:1}, end:{r:1, c:4}},
							{index:1, start:{r:1, c:5}, end:{r:5, c:1}},
							{index:2, start:{r:3, c:1}, end:{r:0, c:2}},
							{index:3, start:{r:1, c:2}, end:{r:3, c:3}},
							{index:4, start:{r:1, c:0}, end:{r:0, c:1}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:5, c:2}, end:{r:5, c:6}},
							{index:1, start:{r:5, c:5}, end:{r:3, c:2}},
							{index:2, start:{r:3, c:3}, end:{r:4, c:5}},
							{index:3, start:{r:6, c:0}, end:{r:6, c:2}},
							{index:4, start:{r:5, c:1}, end:{r:4, c:6}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:4, c:1}, end:{r:6, c:2}},
							{index:1, start:{r:5, c:1}, end:{r:5, c:6}},
							{index:2, start:{r:5, c:5}, end:{r:3, c:2}},
							{index:3, start:{r:3, c:1}, end:{r:3, c:5}},
							{index:4, start:{r:4, c:5}, end:{r:0, c:6}},
							{index:5, start:{r:2, c:1}, end:{r:3, c:4}},
							{index:6, start:{r:1, c:1}, end:{r:2, c:4}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:5, c:0}, end:{r:3, c:6}},
							{index:1, start:{r:4, c:5}, end:{r:6, c:5}},
							{index:2, start:{r:4, c:6}, end:{r:6, c:6}},
							{index:3, start:{r:5, c:3}, end:{r:2, c:5}},
							{index:4, start:{r:5, c:2}, end:{r:1, c:1}},
							{index:5, start:{r:5, c:1}, end:{r:2, c:6}},
							{index:6, start:{r:2, c:2}, end:{r:1, c:5}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:2, c:1}, end:{r:3, c:3}},
							{index:1, start:{r:2, c:4}, end:{r:3, c:1}},
							{index:2, start:{r:4, c:1}, end:{r:1, c:3}},
							{index:3, start:{r:1, c:2}, end:{r:0, c:3}},
							{index:4, start:{r:0, c:2}, end:{r:0, c:0}},
]
					},

					{
						row:7,
						column:7,
						size:80,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:0}, end:{r:1, c:3}},
							{index:1, start:{r:1, c:2}, end:{r:2, c:0}},
							{index:2, start:{r:5, c:0}, end:{r:1, c:5}},
							{index:3, start:{r:5, c:1}, end:{r:4, c:5}},
							{index:4, start:{r:5, c:2}, end:{r:5, c:5}},
							{index:5, start:{r:4, c:6}, end:{r:6, c:0}},
							{index:6, start:{r:3, c:2}, end:{r:1, c:4}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:7, c:1}, end:{r:0, c:4}},
							{index:1, start:{r:1, c:4}, end:{r:2, c:7}},
							{index:2, start:{r:2, c:5}, end:{r:1, c:7}},
							{index:3, start:{r:1, c:6}, end:{r:2, c:4}},
							{index:4, start:{r:3, c:4}, end:{r:5, c:4}},
							{index:5, start:{r:4, c:4}, end:{r:3, c:3}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:1}, end:{r:4, c:3}},
							{index:1, start:{r:5, c:3}, end:{r:7, c:6}},
							{index:2, start:{r:6, c:1}, end:{r:4, c:4}},
							{index:3, start:{r:1, c:6}, end:{r:1, c:3}},
							{index:4, start:{r:7, c:7}, end:{r:5, c:6}},
							{index:5, start:{r:5, c:7}, end:{r:2, c:2}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:0}, end:{r:6, c:7}},
							{index:1, start:{r:6, c:2}, end:{r:4, c:4}},
							{index:2, start:{r:5, c:2}, end:{r:4, c:7}},
							{index:3, start:{r:5, c:7}, end:{r:6, c:3}},
							{index:4, start:{r:3, c:6}, end:{r:1, c:6}},
							{index:5, start:{r:2, c:3}, end:{r:3, c:7}},
							{index:6, start:{r:1, c:7}, end:{r:3, c:1}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:7}, end:{r:4, c:6}},
							{index:1, start:{r:4, c:7}, end:{r:1, c:4}},
							{index:2, start:{r:0, c:0}, end:{r:5, c:7}},
							{index:3, start:{r:7, c:7}, end:{r:6, c:1}},
							{index:4, start:{r:6, c:2}, end:{r:7, c:6}},
							{index:5, start:{r:7, c:1}, end:{r:2, c:0}},
							{index:6, start:{r:1, c:0}, end:{r:5, c:4}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:5, c:0}, end:{r:3, c:5}},
							{index:1, start:{r:4, c:5}, end:{r:5, c:1}},
							{index:2, start:{r:6, c:6}, end:{r:1, c:6}},
							{index:3, start:{r:4, c:0}, end:{r:1, c:1}},
							{index:4, start:{r:3, c:0}, end:{r:2, c:2}},
							{index:5, start:{r:1, c:2}, end:{r:4, c:3}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:7, c:0}, end:{r:4, c:4}},
							{index:1, start:{r:1, c:4}, end:{r:1, c:1}},
							{index:2, start:{r:0, c:3}, end:{r:0, c:5}},
							{index:3, start:{r:4, c:6}, end:{r:0, c:7}},
							{index:4, start:{r:1, c:7}, end:{r:4, c:2}},
							{index:5, start:{r:3, c:1}, end:{r:6, c:7}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:5, c:3}, end:{r:6, c:6}},
							{index:1, start:{r:7, c:0}, end:{r:0, c:6}},
							{index:2, start:{r:7, c:1}, end:{r:7, c:3}},
							{index:3, start:{r:4, c:3}, end:{r:5, c:6}},
							{index:4, start:{r:3, c:3}, end:{r:4, c:1}},
							{index:5, start:{r:2, c:4}, end:{r:0, c:5}},
							{index:6, start:{r:1, c:6}, end:{r:3, c:6}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:7, c:4}, end:{r:0, c:1}},
							{index:1, start:{r:3, c:1}, end:{r:1, c:6}},
							{index:2, start:{r:2, c:6}, end:{r:2, c:4}},
							{index:3, start:{r:1, c:4}, end:{r:6, c:6}},
							{index:4, start:{r:5, c:5}, end:{r:4, c:7}},
							{index:5, start:{r:5, c:2}, end:{r:0, c:6}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:6, c:0}, end:{r:2, c:3}},
							{index:1, start:{r:6, c:6}, end:{r:6, c:4}},
							{index:2, start:{r:5, c:6}, end:{r:0, c:0}},
							{index:3, start:{r:5, c:2}, end:{r:3, c:6}},
							{index:4, start:{r:3, c:7}, end:{r:0, c:7}},
							{index:5, start:{r:2, c:5}, end:{r:4, c:4}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:2}, end:{r:7, c:6}},
							{index:1, start:{r:7, c:7}, end:{r:5, c:3}},
							{index:2, start:{r:5, c:2}, end:{r:4, c:7}},
							{index:3, start:{r:4, c:6}, end:{r:2, c:5}},
							{index:4, start:{r:3, c:3}, end:{r:1, c:4}},
							{index:5, start:{r:7, c:0}, end:{r:7, c:5}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:7, c:7}, end:{r:3, c:6}},
							{index:1, start:{r:2, c:5}, end:{r:6, c:2}},
							{index:2, start:{r:7, c:3}, end:{r:0, c:1}},
							{index:3, start:{r:4, c:3}, end:{r:2, c:4}},
							{index:4, start:{r:4, c:4}, end:{r:5, c:7}},
							{index:5, start:{r:6, c:7}, end:{r:6, c:5}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:0, c:6}, end:{r:6, c:6}},
							{index:1, start:{r:0, c:0}, end:{r:0, c:7}},
							{index:2, start:{r:1, c:4}, end:{r:4, c:0}},
							{index:6, start:{r:6, c:2}, end:{r:2, c:4}},
							{index:5, start:{r:5, c:2}, end:{r:3, c:2}},
							{index:4, start:{r:6, c:3}, end:{r:3, c:4}},
							{index:3, start:{r:4, c:4}, end:{r:5, c:0}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:7, c:1}, end:{r:4, c:5}},
							{index:1, start:{r:3, c:4}, end:{r:1, c:6}},
							{index:2, start:{r:0, c:6}, end:{r:2, c:2}},
							{index:3, start:{r:2, c:3}, end:{r:6, c:6}},
							{index:4, start:{r:6, c:1}, end:{r:1, c:2}},
							{index:5, start:{r:0, c:4}, end:{r:1, c:5}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:7, c:1}, end:{r:3, c:6}},
							{index:1, start:{r:3, c:3}, end:{r:6, c:1}},
							{index:2, start:{r:7, c:2}, end:{r:7, c:7}},
							{index:3, start:{r:4, c:1}, end:{r:0, c:6}},
							{index:4, start:{r:0, c:7}, end:{r:4, c:5}},
							{index:5, start:{r:3, c:1}, end:{r:1, c:3}},
]
					},

					{
						row:8,
						column:8,
						size:70,
						invicible:[],
						pipes:[
							{index:0, start:{r:6, c:1}, end:{r:3, c:6}},
							{index:1, start:{r:0, c:7}, end:{r:1, c:5}},
							{index:2, start:{r:2, c:4}, end:{r:1, c:0}},
							{index:3, start:{r:2, c:2}, end:{r:4, c:1}},
							{index:4, start:{r:3, c:1}, end:{r:4, c:4}},
]
					},

					];