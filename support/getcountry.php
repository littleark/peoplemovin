<?

include("../config.php");
include("functions.php");

if(!$_GET['not_json'])
	header('Content-Type: application/x-json;charset=utf-8');

header("Access-Control-Allow-Origin: *");

/*
$_POST['c']='US';
$_POST['src']=0;
*/
$country_names=getCountryNames();
$other_flow=array();
if($_POST['src']) {
	$flows=getFlowsFrom($_POST['c'],10,"`qta` DESC");
	$index=1;
	$other_flow=getFlowFromTo($_POST['c'],$_POST['o']);
		
} else {
	$flows=getFlowsTo($_POST['c'],10,"`qta` DESC");
	$index=0;
	$other_flow=getFlowFromTo($_POST['o'],$_POST['c']);
}
if($_POST['o']) {
	//var_export($other_flow);
	//var_export($flows);
	if(!in_array($other_flow,$flows))
		array_push($flows,array($other_flow[0],$other_flow[1],$other_flow[2],1));
}

$population=getPopulation(2010,$_POST['c']);
$str.="<h2><a href=\"#".($_POST['src']?'f':'t')."_".$_POST['c']."\" id=\"".($_POST['src']?'from':'to')."_".$_POST['c']."\" title=\"".$country_names[$_POST['c']]."\">".$country_names[$_POST['c']]."</a></h2><h3>Population: <b>".number_format($population[$_POST['c']],0,"",",")."</b></h3><a href=\"#\" class=\"close\" rel=\"".($_POST['src']?'from':'to')."_".$_POST['c']."\">hide</a>";

$migrants=($index?getMigrationTotalFrom(null,$_POST['c']):getMigrationTotalTo(null,$_POST['c']));
$perc=getSimplePercentageOnPopulation($migrants,$_POST['c']);
$str.="<h3>".($index?'E':'Im')."migrants: <b>".number_format($migrants,0,"",",")."</b></h3>";
if(!$index)
	$str.="<h4>% of population: <b>".round($perc,2)."%</b></h4>";

$str.="<h5>".($_POST['src']?"Migrant destinations":"Migrant native countries")."</h5>";
$str.="<ul>";
$i=0;

foreach($flows AS $flow) {
	$add_class='';
	if(isset($flow[3]))
		$add_class='o';
	$str.="<li class=\"p".($i%2)." ".$add_class."\"><a href=\"#c_{$flow[0]}_{$flow[1]}\" id=\"".($index?"to":"from")."_{$flow[$index]}\" class=\"il".($_POST['o']==$flow[$index]?' sel':'')."\"><span class=\"name\"><b>&bull; </b>".$country_names[$flow[$index]]."</span><span class=\"val\">".number_format($flow[2],0,"",",")."</span></a></li>";
	

	
	$i++;
};

$str.="</ul>";

mysql_close();

echo $str;

?>