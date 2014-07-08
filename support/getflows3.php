<?php

include("../config.php");
include("functions.php");

if(!$_GET['not_json'])
	header('Content-Type: application/x-json;charset=utf-8');

header("Access-Control-Allow-Origin: *");

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
$c=getFlowsFrom();
//var_export($c);
$max=array();
$flows=array();
foreach($c AS $flow) {
	if(!$max[$flow[0]]) {
		$max[$flow[0]]=0;
	}
	$max[$flow[0]]+=$flow[2];
}
if($_POST['ie']) {
	foreach($c AS $flow) {
		//$val=ceil($flow[2]/$max['MX']*100);
		$max_value=50;
		$val=(mapValues($flow[2],0,$max['MX'],1,$max_value));
		if(!$flows[$flow[0]]) {
			if($val>1.00825 && $flow[0]!='XS' && $flow[0]!='XN' && $flow[1]!='XS' && $flow[1]!='XN')
				$flows[$flow[0]]=array(
					"flows"=>array()
				);
		}
		//$flows[$flow[0]]["flows"][$flow[1]]=array("flow"=>$flow[2]);

		if($val>1.00825 && $flow[0]!='XS' && $flow[0]!='XN' && $flow[1]!='XS' && $flow[1]!='XN')
			$flows[$flow[0]]["flows"][$flow[1]]=round($val);//array("flow"=>round($val));

	}
} else if($_POST['i']) {
	foreach($c AS $flow) {
		//$val=ceil($flow[2]/$max['MX']*100);
		$max_value=50;
		$val=(mapValues($flow[2],0,$max['MX'],1,$max_value));
		if(!$flows[$flow[0]]) {
			if($val>1.00825 && $flow[0]!='XS' && $flow[0]!='XN' && $flow[1]!='XS' && $flow[1]!='XN')
				$flows[$flow[0]]=array(
					"flows"=>array()
				);
		}
		//$flows[$flow[0]]["flows"][$flow[1]]=array("flow"=>$flow[2]);

		if($val>1.00825 && $flow[0]!='XS' && $flow[0]!='XN' && $flow[1]!='XS' && $flow[1]!='XN')
			$flows[$flow[0]]["flows"][$flow[1]]=round($val);//array("flow"=>round($val));

	}
} else {
	foreach($c AS $flow) {
		//$val=ceil($flow[2]/$max['MX']*100);
		$max_value=120;
		$val=(mapValues($flow[2],0,$max['MX'],0,$max_value));
		if(!$flows[$flow[0]]) {
			if($val>0 && $flow[0]!='XS' && $flow[0]!='XN' && $flow[1]!='XS' && $flow[1]!='XN')
				$flows[$flow[0]]=array(
					"flows"=>array()
				);
		}
		//$flows[$flow[0]]["flows"][$flow[1]]=array("flow"=>$flow[2]);

		if($val>0 && $flow[0]!='XS' && $flow[0]!='XN' && $flow[1]!='XS' && $flow[1]!='XN')
			$flows[$flow[0]]["flows"][$flow[1]]=array("f"=>$flow[2],"v"=>round($val,2));

	}
}

//var_export($flows);
echo json_encode($flows);



/*
"IT":{
	flow:1,
	flows:{
		"DE":{flow:30},
		"RU":{flow:24},
		"SL":{flow:50},
		"GB":{flow:22},
		"US":{flow:44},
		"CL":{flow:1},
		"IN":{flow:11},
		"FR":{flow:34}
	}
},
*/

?>