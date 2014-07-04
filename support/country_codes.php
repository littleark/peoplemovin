<?


include("../config.php");
include("functions.php");

if(!$_GET['not_json'])
	header('Content-Type: application/x-json;charset=utf-8');

$query="SELECT `iso`,`name` AS `name` FROM `country`";
$result=mysql_query($query) or die("what's up with this query? ".$query);

$countries=array();

while ($row = mysql_fetch_assoc($result)) {

	$countries[$row['iso']]=$row['name'];
}


mysql_free_result($result);
mysql_close($link);

echo "var countries=".json_encode($countries);

?>