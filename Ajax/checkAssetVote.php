<?php
require_once("models.php");

header("Content-Type: application/json");

//CHECK LOGIN
if(!isset($_SESSION["loggedUser"]["users_id"])){

    echo json_encode([
        "success"=>true,
        "voted"=>false
    ]);

    exit;

}

//CHECK ASSET ID
if(!isset($_GET["id"])){

    echo json_encode([
        "success"=>false,
        "message"=>"Missing asset id"
    ]);

    exit;

}

$userId = $_SESSION["loggedUser"]["users_id"];
$assetId = $_GET["id"];

$voted = $db->hasUserVoted($userId, $assetId);

echo json_encode([

    "success"=>true,
    "voted"=>$voted

]);

?>