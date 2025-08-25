<?php
$score = $_GET["score"];
$scorex = explode(":", $score);
$highscore = $scorex[0];
?>
<html>
<head>
<title>My Best Result in Space Trip</title>
<meta property="og:title" content="My Best Distance in Space Trip is <?echo $highscore;?>!"/>
<meta property="og:image" content="https://artheads.co/games/spacetrip/share.jpg"/>
<meta property="og:site_name" content="ArtHeads.Co"/>
<meta property="og:description" content="My best distance in Space Trip is <?echo $highscore;?>! Explore the space abyss using a jetpack, in the role of brave astronaut flying through unknown galaxies existing somewhere in alternate surreal dimension. Avoid collisions with planets, meteorites and satellites, not forgetting to catch more coins and some useful stuff like canisters with fuel and additional health refill. Download and play for free now!"/>	
</head>
<body>
<meta http-equiv="refresh" content="0;URL=https://artheads.co" />
</body>
</html>