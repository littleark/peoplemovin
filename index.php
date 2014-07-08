<!DOCTYPE html>
<html>
<head id="www-peoplemov-in">
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title>peoplemovin - A visualization of migration flows</title>
	<meta name="twitter:widgets:csp" content="on">

	<link rel="shortcut icon" href="http://peoplemov.in/favicon.ico" />
	<link href='http://fonts.googleapis.com/css?family=Arvo:regular,bold' rel='stylesheet' type='text/css'>
	<link href='http://fonts.googleapis.com/css?family=Open+Sans:light,regular,bold' rel='stylesheet' type='text/css'>
	
	<link rel="stylesheet" href="css/reset-min.css" type="text/css" media="screen" title="no title" charset="utf-8">
	<link rel="stylesheet" href="css/peoplemovin.css?<?=time()?>" type="text/css" media="screen" title="no title" charset="utf-8">
	<link rel="stylesheet" href="css/finger.css?<?=time()?>" type="text/css" media="screen" title="no title" charset="utf-8">
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<script>window.jQuery || document.write('<script src="js/jquery-1.8.3.min.js"><\/script>')</script>
	<script type='text/javascript' src='js/jquery.spinner.js'></script>
	
	<script src="js/util.js?<?=time()?>" type="text/javascript" charset="utf-8"></script>
	<script src="js/country_codes.js?<?=time()?>" type="text/javascript" charset="utf-8"></script>
	
	<script src="js/jsBezier-0.6.js" type="text/javascript"></script>

</head>
<?php
	include("config.php");
	include("support/functions.php");
?>
<body>
	<div id="wrapper" class="ontop">
		<header>
			<div id="header">
				<h1>people<span>movin</span></h1>
				<h2>migration flows across the world.</h2>
				<div id="social">
					<ul>
						<!--<li>
							<a href="http://pinterest.com/pin/create/button/?url=peoplemov.in&media=http%3A%2F%2Fpeoplemov.in%2Fimg%2Fpeoplemovin.png&description=Migration%20flows%20across%20the%20world" class="pin-it-button" count-layout="horizontal">Pin It</a><script type="text/javascript" src="http://assets.pinterest.com/js/pinit.js"></script>
						</li>-->
						
						<li>
							<div id="fb-root"></div><script src="http://connect.facebook.net/en_US/all.js#xfbml=1"></script><fb:like href="http://www.peoplemov.in" send="false" layout="button_count" width="225" show_faces="false" font="lucida grande"></fb:like>
						</li>
						<li>
							<div class="g-plus" data-action="share" data-annotation="bubble" data-href="http://peoplemov.in"></div>							
						</li>
						<li>
							<a href="http://twitter.com/share" class="twitter-share-button" data-count="horizontal" data-via="littleark" data-counturl="peoplemov.in">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>
						</li>
					</ul>
				</div>
					
			</div>
		</header>
		<div id="flows_container" class="canvas_container clearfix">
			<canvas id="flows" width="940" class="datamovin"></canvas>
			<div id="src_title" class="ititle"></div>
			<div id="dst_title" class="ititle"></div>
			<div id="tooltip">
				<div>
				<span id="flow"></span> people have moved from
				<span id="from"></span>
				to <span id="to"></span>
				</div>
				<span class="dot"></span>
			</div>
		</div>
		<div class="clearfix"></div>

		<div id="src_info" class="info"></div>
		<div id="dst_info" class="info"></div>

		<div id="contents" class="ontop">
			<div style="position:absolute;width:100px;height:300px;">
				<img id="download" width="100" height="300" style="width:100px;height:300px;border:1px solid #fff">
			</div>
			<div class="par">
				<h3>World Population: <strong><?$world_pop=getWorldPopulation();echo number_format($world_pop,0,"",",")?></strong></h3>
				<h3>Migrants in the world: <strong><? $migrants=getMigrationTotal();echo number_format($migrants,0,"",",");?></strong></h3>
				<br/><br/>
				<p>
				Almost <strong><?=round($migrants/1000000)?></strong> million people, or <strong><?=round($migrants/$world_pop*100,2)?>%</strong> of the world population, live outside their countries.
				<br/><br/>
				Click on a country box to know more about migration flow to/from that country.
				</p>
				<div class="finger_container">
					<div class="finger">
						<div class="left"></div>
						<div class="arm"></div>
						<span>click a box</span>
					</div>
				</div>
			</div>
			<div class="par">
				<h4>Top migrant destination<a class="more" href="#src">see more</a></h4>
				<?
				$country_names=getCountryNames();
				$countries=getCountriesFlowsTo(null);
				
				?>
				<br/>
				<ul>
					<?
						$i=0;
						foreach($countries AS $iso=>$qta) {
							?>
							<li class="p<?=$i%2?>"><a href="#t_<?=$iso?>" id="to_<?=$iso?>"><span class="name"><?=$country_names[$iso]?></span><span class="val"><?=number_format($qta,0,"",",")?></span></a></li>
							<?
							$i++;
							if($i==10) {
								echo "</ul><ul class=\"hidden\">";
							}
						}
					
					?>
				</ul>
			</div>
			<div class="par">
				<h4>Top emigration countries<a class="more" href="#dst">see more</a></h4>
				<?
				$countries=getCountriesFlowsFrom(null);
				
				?>
				<ul>
					<?
						$i=0;
						foreach($countries AS $iso=>$qta) {
							?>
							<li class="p<?=$i%2?>"><a href="#f_<?=$iso?>" id="from_<?=$iso?>"><span class="name"><?=$country_names[$iso]?></span><span class="val"><?=number_format($qta,0,"",",")?></span></a></li>
							<?
							$i++;
							if($i==10) {
								echo "</ul><ul class=\"hidden\">";
							}
						}
					
					?>
				</ul>
			</div>
			<div class="par">
				<h4>Top migration corridors<a class="more" href="#cor">see more</a></h4>
				<?
				$corridors=getCorridors(100);
				
				?>
				<ul>
					<?
						$i=0;
						foreach($corridors AS $c) {
							?>
							<li class="p<?=$i%2?>"><a href="#c_<?=$c['src']?>_<?=$c['dst']?>" id="con_<?=$c['src']?>_<?=$c['dst']?>"><span class="name"><?=$country_names[$c['src']]?>-<?=$country_names[$c['dst']]?></span><span class="val"><?=number_format($c['qta'],0,"",",")?></span></a></li>
							<?
							$i++;
							if($i==10) {
								echo "</ul><ul class=\"hidden\">";
							}
						}
					
					?>
				</ul>
			</div>
			<div class="par">
				<h4>Refugees and Asylum</h4>
				<br/>
				<p>
					Refugees and asylum seekers made up <strong>16.3</strong> million, or <strong>8%</strong>, of international migrants in 2010. The Middle East and North Africa region had the largest share of refugees and asylum seekers among immigrants (65%), followed by South Asia (20%), Sub-Saharan Africa (17%), and East Asia and Pacific (8.8%).
				</p>
			</div>
			<div class="par">
				<h4>About people<strong>movin</strong></h4>
				<br/>
				<p>
					people<strong>movin</strong> shows the flows of migrants as of 2010 through the use of open data (see Data Sources). The data are presented as a slopegraph that shows the connections between countries. The chart is split in two columns, the emigration countries on the left and the destination countries on the right. The thickness of the lines connecting the countries represents the amount of immigrated people.
				</p>
			</div>
			<div class="par">
				<h4>Data Sources</h4>
				<br/>
				<p>
					All the presented data are based on the <a href="http://data.worldbank.org/data-catalog/migration-and-remittances" target="_blank">Migration and Remittances Factbook 2011</a>
					reporting the latest available as of <strong>October 1, 2010</strong>.
					<br/><br/>
					The database of the UN Population Division is the most comprehensive source of information on international
					migrant stocks for the period <strong>1960-2010</strong> for all 210 countries in the Migration and Remittances
					Factbook 2011.
				</p>
					<br/>
					<h5>Migration Data</h5>
					<a href="http://data.worldbank.org/" target="_blank">The World Bank Open Data</a><br/>
					<a href="http://econ.worldbank.org/WBSITE/EXTERNAL/EXTDEC/EXTDECPROSPECTS/0,,contentMDK:22803131~pagePK:64165401~piPK:64165026~theSitePK:476883,00.html" target="_blank">Bilateral Migration and Remittances 2010</a>
					<br/>
					<br/>
					<h5>Migration, Refugees and Asylum</h5>
					<a href="http://data.worldbank.org/data-catalog/migration-and-remittances" target="_blank">Migration and Remittances Factbook 2011</a>
					<br/><br/>
					<h5>World Population Data</h5>
					<a href="http://www.census.gov/ipc/www/idb/" target="_blank">U.S. Census Bureau, International Data Base</a>
					
				
			</div>
			<div class="par">
				<h4>Why people<strong>movin</strong>?</h4>
				<br/>
				<p>
				people<strong>movin</strong> is an experimental project in data visualization by Carlo Zapponi.
				<br/><br/>
				The current version of people<strong>movin</strong> is based on a HTML5 toolkit for the creation of flow 
				charts called data<strong>movin</strong>. I'm currently working on it and I'll make it available 
				<span class="not">soon</span>. In the meanwhile you can enjoy version 0.4 by exploring the public 
				<a href="https://github.com/littleark/peoplemovin" target="_blank">github repository</a>.
				
				<br/><br/>
				Follow me on <a href="http://twitter.com/littleark" target="_blank">twitter</a> <a href="http://twitter.com/littleark" class="twitter-follow-button" data-button="grey" data-text-color="#FFFFFF" data-link-color="#00AEFF" data-show-count="false">Follow @littleark</a>
				<script src="http://platform.twitter.com/widgets.js" type="text/javascript"></script>
				<br/><br/>
				Contact me at <a href="mailto:info@makinguse.com">info[at]makinguse.com</a>
				</p>
			</div>
			<div class="clearfix"></div>
		</div>
		<div class="clearfix"></div>
		
	</div>
	<div class="clearfix"></div>
	<div id="footer">

			<h1 class="logo">
				<div id="logo">people<span>movin</span></div>
				<span><a href="http://www.makinguse.com" target="_blank" title="">Carlo Zapponi</a>, 2011</span>
			</h1>
			<div id="licence"><a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/" class="cc" target="_blank"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><div>This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">Creative Commons BY-NC-SA License</a>.</div></div>
		</div>
	<script src="js/DataMovin.js?<?=time()?>" type="text/javascript" charset="utf-8"></script>
	<script src="js/DataMovinInteractions.js?<?=time()?>" type="text/javascript" charset="utf-8"></script>
	<script src="js/finger.js?<?=time()?>" type="text/javascript" charset="utf-8"></script>
	<script src="js/flows.js?<?=time()?>" type="text/javascript" charset="utf-8"></script>
	<script type="text/javascript" src="https://apis.google.com/js/platform.js"></script>
	<script>
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-364839-23', 'auto');
	  ga('send', 'pageview');
	</script>
</body>
</html>