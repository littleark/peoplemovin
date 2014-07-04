<?php

$db="peoplemovin";
$user="root";
$pwd="";

$link=mysql_connect("localhost",$user,$pwd);
mysql_select_db($db) or die("can't select DB: ".$db);

date_default_timezone_set('Europe/Rome');

?>