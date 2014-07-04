<?php
function mapValues($value, $istart, $istop, $ostart, $ostop) {
	return $ostart + ($ostop - $ostart) * (($value - $istart) / ($istop - $istart));
};

function getCountryNames(){
	$query="SELECT `name`,`iso` FROM `country`";
	$result_countries=mysql_query($query) or die("what's up with this query? ".$query);

	$countries=array();
	while ($row = mysql_fetch_assoc($result_countries)) {
		//array_push($countries,array('cc'=>$row['country_code'],'cn'=>$row['continent']));
		$countries[$row['iso']]=$row['name'];
	}
	
	return $countries;
}

function getCountryCodes(){
	$query="SELECT `name`,`iso` FROM `country`";
	$result_countries=mysql_query($query) or die("what's up with this query? ".$query);

	$countries=array();
	while ($row = mysql_fetch_assoc($result_countries)) {
		//array_push($countries,array('cc'=>$row['country_code'],'cn'=>$row['continent']));
		$countries[$row['name']]=$row['iso'];
	}
	
	return $countries;
}

function getCountries(){

	$query_countries="SELECT `iso`,`continent` FROM `country` INNER JOIN `location_continent` ON `iso`=`country`";
	$result_countries=mysql_query($query_countries) or die("what's up with this query? ".$query_countries);

	$countries=array();
	while ($row = mysql_fetch_assoc($result_countries)) {
		//array_push($countries,array('cc'=>$row['country_code'],'cn'=>$row['continent']));
		$countries[$row['iso']]=$row['continent'];
	}
	
	return $countries;
}

function getContinentCountries($country_code) {
	$countries=array();
	
	$query_countries="SELECT `country` FROM `location_continent` WHERE `continent`='$country_code'";
	
	$result_countries=mysql_query($query_countries) or die("what's up with this query? ".$query_countries);

	$countries=array();
	while ($row = mysql_fetch_assoc($result_countries)) {
		array_push($countries,$row['country']);
	}
	
	return $countries;
	
}
function getMigrationTotal(){
	$query="SELECT SUM(`qta`) AS `sum` FROM `flows`";
	$result_tot=mysql_query($query) or die("what's up with this query? ".$query);
	return round(mysql_result($result_tot,0,0));
}
function getMigrationTotalTo($continent=null,$country=null){
	
	if($continent) {
		//$query.=" INNER JOIN `location_continent` ON `iso`=`country` WHERE `iso` IN (SELECT `country` FROM `location)"
		$query="SELECT SUM(`qta`) AS `sum` FROM `flows`,`location_continent` WHERE `dst`=`country` AND `continent`='$continent'";
	} elseif ($country) {
		$query="SELECT SUM(`qta`) AS `sum` FROM `flows` WHERE `dst`='$country'";
	} else {
		return 0;
	}
	$result_tot=mysql_query($query) or die("what's up with this query? ".$query);
	return round(mysql_result($result_tot,0,0));
}
function getMigrationTotalFrom($continent=null,$country=null){
	
	if($continent) {
		//$query.=" INNER JOIN `location_continent` ON `iso`=`country` WHERE `iso` IN (SELECT `country` FROM `location)"
		$query="SELECT SUM(`qta`) AS `sum` FROM `flows`,`location_continent` WHERE `src`=`country` AND `continent`='$continent'";
	} elseif ($country) {
		$query="SELECT SUM(`qta`) AS `sum` FROM `flows` WHERE  `src`='$country'";
	} else {
		return 0;
	}
	$result_tot=mysql_query($query) or die("what's up with this query? ".$query);
	return round(mysql_result($result_tot,0,0));
}
function getContinentsTo() {
	$continents=array('as'=>array(),'eu'=>array(),'af'=>array(),'oc'=>array(),'na'=>array(),'an'=>array(),'sa'=>array());
	
	foreach($continents AS $country_code=>$c){
		$continents[$country_code]=getMigrationTotalTo($country_code);
	}
	
	return $continents;
}
function getContinentsFrom() {
	$continents=array('as'=>array(),'eu'=>array(),'af'=>array(),'oc'=>array(),'na'=>array(),'an'=>array(),'sa'=>array());
	
	foreach($continents AS $country_code=>$c){
		$continents[$country_code]=getMigrationTotalFrom($country_code);
	}
	
	return $continents;
}
function getCorridors($limit=0){
	$LIMIT='';
	if($limit)
		$LIMIT=" LIMIT $limit";
	$WHERE="WHERE `dst`!='XS' AND `dst`!='XN' AND `src`!='XS' AND `src`!='XN' AND `qta`>0 ";
	$query="SELECT `qta`,`dst`,`src` FROM `flows` $WHERE ORDER BY `qta` DESC $LIMIT";
	$result_countries=mysql_query($query) or die("what's up with this query? ".$query);
	$corridors=array();
	while ($row = mysql_fetch_assoc($result_countries)) {
		$corridors[]=($row);
	}
	return $corridors;
	
}
function getCountriesFlowsTo($country=null,$limit=0) {
	$WHERE="WHERE `dst`!='XS' AND `dst`!='XN'  AND `qta`>0 ";
	$LIMIT='';
	if($country!=null)
		$WHERE.="AND `dst`='$country' ";
	if($limit)
		$LIMIT=" LIMIT $limit";
	$query="SELECT SUM(`qta`) AS `sum`,`dst` FROM `flows` $WHERE GROUP BY `dst` ORDER BY `sum` DESC $LIMIT";
	$result_countries=mysql_query($query) or die("what's up with this query? ".$query);
	$countries=array();
	while ($row = mysql_fetch_assoc($result_countries)) {
		$countries[$row['dst']]=round($row['sum']);
	}
	if($country!=null)
		return $countries[$country];
	return $countries;
}
function getCountriesFlowsFrom($country=null,$limit=0) {
	$WHERE=" WHERE `src`!='XS' AND `src`!='XN'  AND `qta`>0 ";
	$LIMIT='';
	if($country!=null)
		$WHERE.="AND `src`='$country' ";
	if($limit)
		$LIMIT=" LIMIT $limit";
	$query="SELECT SUM(`qta`) AS `sum`,`src` FROM `flows` $WHERE GROUP BY `src` ORDER BY `sum` DESC $LIMIT";
	$result_countries=mysql_query($query) or die("what's up with this query? ".$query);
	$countries=array();
	while ($row = mysql_fetch_assoc($result_countries)) {
		$countries[$row['src']]=round($row['sum']);
	}
	if($country!=null)
		return $countries[$country];
	return $countries;
}
function getFlowsTo($country=null,$limit=0,$order="`dst`"){
	$WHERE=" AND `dst`!='XS' AND `dst`!='XN' AND `src`!='XS' AND `src`!='XN' ";
	
	if($country)
		$WHERE.=" AND `dst`='$country' ";
	if($limit)
		$LIMIT=" LIMIT $limit";
			
	$query="SELECT `src`,`dst`,`qta` FROM `flows` WHERE `qta`>0 $WHERE ORDER BY $order $LIMIT";
	$result=mysql_query($query) or die("what's up with this query? ".$query);

	$people=array();

	while ($row = mysql_fetch_assoc($result)) {
		//if(!$people[$row['src']])
		//	$people[$row['src']]=array();
		//$people[$row['src']][$row['dst']]=$row['qta'];
		if($row['qta']>=1)
			array_push($people, array($row['src'],$row['dst'],round($row['qta'])));
	}
	
	return $people;
}
$countries=getCountryNames();

function cmp($a, $b) {
	global $countries;
	
	return strcmp($countries[$a[0]], $countries[$b[0]]);
	//return $countries[$a[0]] < $countries[$b[0]];
}
function getFlowsFrom($country=null,$limit=0,$order="`src`"){
	$WHERE=" AND `dst`!='XS' AND `dst`!='XN' AND `src`!='XS' AND `src`!='XN' ";
	if($country)
		$WHERE.="AND `src`='$country'";
	if($limit)
		$LIMIT=" LIMIT $limit";
	$query="SELECT `src`,`dst`,`qta` FROM `flows` WHERE `qta`>0 $WHERE ORDER BY $order $LIMIT";//ORDER BY `qta` DESC";
	//echo $query;
	$result=mysql_query($query) or die("what's up with this query? ".$query);

	$people=array();

	while ($row = mysql_fetch_assoc($result)) {
		//if(!$people[$row['src']])
		//	$people[$row['src']]=array();
		//$people[$row['src']][$row['dst']]=$row['qta'];
		if($row['qta']>=1) {
			array_push($people, array($row['src'],$row['dst'],round($row['qta'])));
		}
	}

	if($order=="`src`")
		usort($people,'cmp');
	return $people;
}
function getFlowFromTo($from,$to){
	$people=array();
	$query="SELECT `src`,`dst`,`qta` FROM `flows` WHERE `src`='$from' AND `dst`='$to'";
	$result=mysql_query($query) or die("what's up with this query? ".$query);
	$row = mysql_fetch_assoc($result);
	return array($row['src'],$row['dst'],round($row['qta']));
}
function getWorldPopulation($year=2010){
	$query="SELECT SUM(`population`) FROM `population` WHERE `year`='$year'";
	$result_tot=mysql_query($query) or die("what's up with this query? ".$query);
	return mysql_result($result_tot,0,0);
}
function getPopulation($year=2010,$country=null){
	$query="SELECT `country`,`population` FROM `population` WHERE `year`=$year";
	if($country!=null)
		$query.=" AND `country`='$country';";
	$result_countries=mysql_query($query) or die("what's up with this query? ".$query);
	$countries=array();
	while ($row = mysql_fetch_assoc($result_countries)) {
		$countries[$row['country']]=$row['population'];
	}
	return $countries;
}
function getSimplePercentageOnPopulation($data2becompared,$country,$year=2010){
	$population=getPopulation($year,$country);
	return $data2becompared/$population[$country]*100;
}
function getPercentageOnPopulation($data2becompared,$year=2010) {
	$percentages=array();
	$population=getPopulation($year);
	foreach($data2becompared AS $country=>$val) {
		if($population[$country])
			$percentages[$country]=($val)/$population[$country]*100;
	}
	return $percentages;
}
/*
 * function gcd()
 * 
 * returns greatest common divisor
 * between two numbers
 * tested against gmp_gcd()
 */
function gcd($a, $b)
{
    if ($a == 0 || $b == 0)
        return abs( max(abs($a), abs($b)) );
        
    $r = $a % $b;
    return ($r != 0) ?
        gcd($b, $r) :
        abs($b);
}

/*
 * function gcd_array()
 * 
 * gets greatest common divisor among
 * an array of numbers
 */
function gcd_array($array, $a = 0)
{
    $b = array_pop($array);
    return ($b === null) ?
        (int)$a :
        gcd_array($array, gcd($a, $b));
}
?>