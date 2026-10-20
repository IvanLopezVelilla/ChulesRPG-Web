<?php
require_once("models.php");
header("Content-Type: application/json");

$response=[];

//Logged check
if(!isset($_SESSION["loggedUser"])){

    $response["success"]=false;
    $response["code"]=401;
    $response["message"]="You must be logged in";

    echo json_encode($response);
    exit;

}

//Get user
$user=$db->getUser($_SESSION["loggedUser"]["users_id"]);

if(!$user){

    $response["success"]=false;
    $response["code"]=404;
    $response["message"]="User not found";

    echo json_encode($response);
    exit;

}

//Admin check
if($user["admin"]!=1){

    $response["success"]=false;
    $response["code"]=403;
    $response["message"]="Admin access required";

    echo json_encode($response);
    exit;

}

//Data check
if(!isset($_POST["id"])){

    $response["success"]=false;
    $response["code"]=400;
    $response["message"]="News id is required";

    echo json_encode($response);
    exit;

}

$newsId=intval($_POST["id"]);

//Delete
if($db->deleteNews($newsId)){

    $response["success"]=true;
    $response["code"]=200;
    $response["message"]="News deleted successfully";

}else{

    $response["success"]=false;
    $response["code"]=500;
    $response["message"]="Could not delete news";

}

echo json_encode($response);

?>