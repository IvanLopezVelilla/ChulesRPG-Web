<?php

require_once("models.php");

$messages=$db->getMessages();

if($messages===false){

    echo json_encode(["success" => false]);

}else{

    echo json_encode([

        "success" => true,
        "messages" => $messages

    ]);

}

?>