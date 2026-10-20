<?php

require_once("models.php");

try{

    header('Content-Type: application/json');

    echo json_encode(

        $db->getSortedAssets(

            $_GET["sort"],
            $_GET["page"],
            $_GET["limit"],
            $_GET["category"],
            $_GET["search"]

        )

    );

}catch(Exception $e){

    echo json_encode([

        "data"=>[],
        "total"=>0

    ]);

}
?>