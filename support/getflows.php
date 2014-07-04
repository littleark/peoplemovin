<?

include("../config.php");
include("functions.php");

if(!$_GET['not_json'])
	header('Content-Type: application/x-json;charset=utf-8');
/*
$query="SELECT `src`,`dst`,`qta` FROM `flows` WHERE `qta`>0 AND `dst`='IT' ORDER BY `qta` DESC";
$result=mysql_query($query) or die("what's up with this query? ".$query);

$people=array();

while ($row = mysql_fetch_assoc($result)) {
	//if(!$people[$row['src']])
	//	$people[$row['src']]=array();
	//$people[$row['src']][$row['dst']]=$row['qta'];
	array_push($people, array($row['src'],$row['dst'],round($row['qta'])));
}
//shuffle($people);

$money=array();

mysql_free_result($result);
mysql_close($link);

echo json_encode(array('people'=>$people,'money'=>$money));
*/

$max=0;
$c=getFlowsTo('IT');
//var_export($c);
$new_flows=array();
foreach($c AS $flow) {
	
	$f=$flow[2];
	/*
	if(!$new_flows[$flow[0]])
		$new_flows[$flow[0]]=array();
	array_push($new_flows[$flow[0]],array('f'=>$f,'to'=>$flow[1]));
	echo "adding $f from {$flow[0]} to {$flow[1]}\n";
	*/
	$max=max($f,$max);
}
//var_export($new_flows);
$tm=array();
foreach($c AS $flow) {
	//$f=ceil($flow[2]/500);
	$f=ceil($flow[2]*count($c)/$max);
	//if(!$tm[$f])
	//	$tm[$f]=array();
	//array_push($tm[$f],array('from'=>$flow[0],'to'=>$flow[1],'n'=>$f));
	array_push($tm,array('from'=>$flow[0],'to'=>$flow[1],'n'=>(count($c))-$f+1));
}
//$tm['l']=$max;
echo json_encode($tm);
//var_export($tm);
/*
$timed_flow=array();
foreach($new_flows AS $from=>$flow) {
	$timed_flow[$from]=array('flow'=>$flow['f'],'t'=>round($max/$flow['f']),'to'=>$flow['to']);
}
*/
//var_export($timed_flow);
/*
$tm=array();
foreach($timed_flow AS $from=>$flow) {
	if(!$tm[$flow['t']])
		$tm[$flow['t']]=array();
	array_push($tm[$flow['t']],array('from'=>$from,'to'=>$flow['to'],'n'=>$flow['flow']));	
}
$tm['l']=$max;//$tm["1"][0]['n'];
*/
//var_export($tm);
//echo json_encode($tm);
//$gcd = gcd_array($new_flows);
//echo $gcd;

/*
//var_export(getPercentageOnPopulation(getCountriesFlowsTo()));
$w=getWorldPopulation();
$m=getMigrationTotal();
echo "$m on $w is ".($m/$w*100);

echo "<pre>";
var_export(getCountriesFlowsFrom());
echo "</pre>";
*/

?>