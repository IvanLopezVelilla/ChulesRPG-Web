<?php
require_once("models.php");

header("Content-Type: application/json");

//CHECK LOGIN
if(!isset($_SESSION["loggedUser"]["users_id"])){

    echo json_encode([
        "success"=>false,
        "message"=>"You must be logged in"
    ]);

    exit;

}

//CHECK ID
if(!isset($_GET["id"])){

    echo json_encode([
        "success"=>false,
        "message"=>"Missing asset id"
    ]);

    exit;

}

$userId=$_SESSION["loggedUser"]["users_id"];
$assetId=$_GET["id"];

//ALREADY VOTED
if($db->hasUserVoted($userId, $assetId)){

    $result=$db->removeVote($userId, $assetId);

    echo json_encode([

        "success"=>$result,
        "voted"=>false

    ]);

}

//NEW VOTE
else{

    $result=$db->voteAsset($userId, $assetId);

    echo json_encode([

        "success"=>$result,
        "voted"=>true

    ]);

}

?>