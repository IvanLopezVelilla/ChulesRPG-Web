<?php

require_once("models.php");

//Check login
if(!isset($_SESSION["loggedUser"])){

    echo json_encode(array(

        "success"=>false,
        "code"=>401,
        "message"=>"You must be logged in"

    ));

    exit;

}

//Check admin
if($_SESSION["loggedUser"]["admin"]!=1){

    echo json_encode(array(

        "success"=>false,
        "code"=>403,
        "message"=>"Admin permissions required"

    ));

    exit;

}

//Check message id
if(!isset($_POST["messageId"])){

    echo json_encode(array(

        "success"=>false,
        "code"=>400,
        "message"=>"Message id missing"

    ));

    exit;

}

$messageId=(int)$_POST["messageId"];

//Delete message
$result=$db->deleteMessage($messageId);

if($result){

    echo json_encode(array(

        "success"=>true

    ));

}else{

    echo json_encode(array(

        "success"=>false,
        "code"=>500,
        "message"=>"Could not delete message"

    ));

}