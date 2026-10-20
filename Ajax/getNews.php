<?php

require_once("models.php");

header("Content-Type: application/json");

$isAdmin=false;

if(isset($_SESSION["loggedUser"])){

    $isAdmin=$_SESSION["loggedUser"]["admin"]==1;

}

$news=$db->getNews($isAdmin);

if($news!==false){

    echo json_encode([
        "success"=>true,
        "news"=>$news
    ]);

}else{

    echo json_encode([
        "success"=>false,
        "code"=>500,
        "message"=>"Could not load news"
    ]);

}