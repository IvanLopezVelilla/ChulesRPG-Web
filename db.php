<?php

class db{

    private $pdo;

    function __construct($host,$port,$db,$user,$pass){

        $this->pdo=new PDO("mysql:host=".$host.";port=".$port.";dbname=".$db.";charset=utf8mb4",$user,$pass);

    }


    //Functions
    //Finds an user by name and returns their id
    function getUserIdByName($name){

        $sentence="SELECT users_id FROM users WHERE name=:name";
        $execution=$this->pdo->prepare($sentence);
        $execution->execute(

            array(

                ":name"=>$name

            )

        );

        $resp=$execution->fetch(PDO::FETCH_ASSOC);
        
        return $resp ? $resp["users_id"] : null;

    }


    //Finds an user by email and returns their id
    function getUserIdByEmail($email){

        $sentence="SELECT users_id FROM users WHERE email=:email";
        $execution=$this->pdo->prepare($sentence);
        $execution->execute(

            array(

                ":email"=>$email

            )

        );

        $resp=$execution->fetch(PDO::FETCH_ASSOC);
        
        return $resp ? $resp["users_id"] : null;

    }


    //Finds an user by id and returns all their data
    function getUser($id){

        $sentence="SELECT * FROM users WHERE users_id=:id";
        $execution=$this->pdo->prepare($sentence);
        $execution->execute(

            array(

                ":id"=>$id

            )

        );

        $resp=$execution->fetch(PDO::FETCH_ASSOC);
        
        return $resp;

    }


    //Returns an array with all categories
    function getCategories(){

        $sentencia="SELECT * FROM categories";
        $ejecucion=$this->pdo->prepare($sentencia);
        $ejecucion->execute();
        
        $res=$ejecucion->fetchAll(PDO::FETCH_ASSOC);
        return $res;

    }


    //Returns the main image of an asset
    function getAssetImage($asset_id){

        $sentence="SELECT * FROM files WHERE asset_id=:id ORDER BY name ASC LIMIT 1";
        $execution=$this->pdo->prepare($sentence);
        $execution->execute(

            array(

                ":id"=>$asset_id

            )

        );

        $resp=$execution->fetch(PDO::FETCH_ASSOC);
        
        return $resp;

    }


    //Finds and returns an asset by id
    function getAssetById($id){

        //ASSET
        $sentence =

            "SELECT

                assets.*,
                users.name AS author_name,
                categories.name AS category_name

            FROM assets

            LEFT JOIN users
            ON users.users_id = assets.author

            LEFT JOIN categories
            ON categories.categories_id = assets.category

            WHERE assets.assets_id = :id

            LIMIT 1";

        $execution = $this->pdo->prepare($sentence);

        $execution->execute([

            ":id" => $id

        ]);

        $asset = $execution->fetch(PDO::FETCH_ASSOC);

        if(!$asset){

            return null;

        }

        //IMAGES
        $sentence =

            "SELECT image
            FROM files
            WHERE asset_id = :id
            ORDER BY name ASC";

        $execution = $this->pdo->prepare($sentence);

        $execution->execute([

            ":id" => $id

        ]);

        $images = $execution->fetchAll(PDO::FETCH_ASSOC);

        //ADD IMAGES ARRAY
        $asset["images"] = $images;

        return $asset;

    }


    //Returns the 5 most voted assets
    function getTopAssets($limit = 5){

        $assetsData=$this->getSortedAssets("popular", 1, $limit, "all", "");
        $assets=$assetsData["data"];

        foreach($assets as &$asset){

            $asset["image"]=$this->getAssetImage($asset["assets_id"]);

        }

        return $assets;

    }


    //Deletes an asset by id
    function deleteAsset($assetId){

        //Delete files first
        $sentence = "DELETE FROM files WHERE asset_id=:id";

        $execution = $this->pdo->prepare($sentence);

        $execution->execute(array(

            ":id"=>$assetId

        ));

        //Delete asset
        $sentence = "DELETE FROM assets WHERE assets_id=:id";

        $execution = $this->pdo->prepare($sentence);

        return $execution->execute(array(

            ":id"=>$assetId

        ));

    }


    //Checks if a user already voted an asset
    function hasUserVoted($userId, $assetId){

        $sentence =
            "SELECT *
            FROM votes
            WHERE users_id=:userId
            AND assets_id=:assetId";

        $execution = $this->pdo->prepare($sentence);

        $execution->execute(array(

            ":userId"=>$userId,
            ":assetId"=>$assetId

        ));

        return $execution->fetch(PDO::FETCH_ASSOC) != false;

    }


    //Votes an asset
    function voteAsset($userId, $assetId){

        try{

            $this->pdo->beginTransaction();

            //Insert vote
            $sentence =
                "INSERT INTO votes(users_id, assets_id)
                VALUES(:userId, :assetId)";

            $execution = $this->pdo->prepare($sentence);

            $execution->execute(array(

                ":userId"=>$userId,
                ":assetId"=>$assetId

            ));

            //Increase asset votes
            $sentence =
                "UPDATE assets
                SET votes = votes + 1
                WHERE assets_id=:assetId";

            $execution = $this->pdo->prepare($sentence);

            $execution->execute(array(

                ":assetId"=>$assetId

            ));

            $this->pdo->commit();

            return true;

        }catch(Exception $e){

            $this->pdo->rollBack();

            return false;

        }

    }


    //Removes vote from an asset
    function removeVote($userId, $assetId){

        try{

            $this->pdo->beginTransaction();

            //Delete vote
            $sentence =
                "DELETE FROM votes
                WHERE users_id=:userId
                AND assets_id=:assetId";

            $execution = $this->pdo->prepare($sentence);

            $execution->execute(array(

                ":userId"=>$userId,
                ":assetId"=>$assetId

            ));

            //Decrease votes
            $sentence =
                "UPDATE assets
                SET votes = votes - 1
                WHERE assets_id=:assetId
                AND votes > 0";

            $execution = $this->pdo->prepare($sentence);

            $execution->execute(array(

                ":assetId"=>$assetId

            ));

            $this->pdo->commit();

            return true;

        }catch(Exception $e){

            $this->pdo->rollBack();

            return false;

        }

    }


    //Returns sorted assets with pagination
    function getSortedAssets($sort, $page, $limit, $category, $search){

        $offset=($page - 1) * $limit;

        $where=[];
        $params=[];

        //CATEGORY
        if($category!="all"){

            $where[]="category=:category";
            $params[":category"]=$category;

        }

        //SEARCH
        if(trim($search)!=""){

            $where[]="name LIKE :search";
            $params[":search"]="%".$search."%";

        }

        $whereSQL="";

        if(count($where)>0){

            $whereSQL="WHERE " . implode(" AND ", $where);

        }

        //SORT
        $order="votes DESC";

        if($sort=="newest"){

            $order="assets_id DESC";

        }

        else if($sort=="oldest"){

            $order="assets_id ASC";

        }

        //TOTAL
        $countSentence="SELECT COUNT(*) as total FROM assets $whereSQL";

        $countExecution=$this->pdo->prepare($countSentence);
        $countExecution->execute($params);

        $total=$countExecution->fetch(PDO::FETCH_ASSOC)["total"];

        //DATA
        $sentence="SELECT * FROM assets $whereSQL ORDER BY $order LIMIT :limit OFFSET :offset";
        $execution=$this->pdo->prepare($sentence);

        foreach($params as $key=>$value){

            $execution->bindValue($key, $value);

        }

        $execution->bindValue(":limit", (int)$limit, PDO::PARAM_INT);
        $execution->bindValue(":offset", (int)$offset, PDO::PARAM_INT);

        $execution->execute();

        return [

            "data"=>$execution->fetchAll(PDO::FETCH_ASSOC),
            "total"=>$total

        ];

    }


    //Returns forum messages ordered by newest first
    function getMessages($limit=50){

        try{

            $sentence=
                "SELECT

                    messages.*,
                    users.name AS authorName,
                    users.admin AS admin

                FROM messages

                LEFT JOIN users
                ON users.users_id = messages.author

                ORDER BY messages.messages_id ASC

                LIMIT :limit";

            $execution=$this->pdo->prepare($sentence);

            $execution->bindValue(":limit", (int)$limit, PDO::PARAM_INT);

            $execution->execute();

            return $execution->fetchAll(PDO::FETCH_ASSOC);

        }catch(Exception $e){

            return false;

        }

    }


    //Inserts a forum message
    function insertMessage($message, $author){

        try{

            $sentence=
                "INSERT INTO messages(message, author)
                VALUES(:message, :author)";

            $execution=$this->pdo->prepare($sentence);

            return $execution->execute(array(

                ":message"=>$message,
                ":author"=>$author

            ));

        }catch(Exception $e){

            return false;

        }

    }


    //Deletes a forum message
    function deleteMessage($messageId){

        try{

            $sentence=
                "DELETE FROM messages
                WHERE messages_id=:id";

            $execution=$this->pdo->prepare($sentence);

            return $execution->execute(array(

                ":id"=>$messageId

            ));

        }catch(Exception $e){

            return false;

        }

    }


    //Returns all the changelogs and their changes from the db
    function getChangelogs(){

        try{

            $sentence="
                SELECT *
                FROM changelogs
                ORDER BY date DESC
            ";

            $execution=$this->pdo->prepare($sentence);
            $execution->execute();

            $changelogs=$execution->fetchAll(PDO::FETCH_ASSOC);

            $sentence="
                SELECT *
                FROM changes
                WHERE changelog=:id
                ORDER BY changes_id ASC
            ";

            $execution=$this->pdo->prepare($sentence);

            foreach($changelogs as &$log){

                $execution->execute([
                    ":id"=>$log["changelogs_id"]
                ]);

                $log["changes"]=$execution->fetchAll(PDO::FETCH_ASSOC);
            }

            return $changelogs;

        }catch(Exception $e){
            return false;
        }
    }


    //Inserts a new changelog on db
    function insertChangelog($name, $type, $build, $changes, $userId){

        try{

            $this->pdo->beginTransaction();

            //ChangeLog
            $sentence=
                "INSERT INTO changelogs(name, type, date, build)
                VALUES(:name, :type, NOW(), :build)";

            $execution=$this->pdo->prepare($sentence);

            $execution->execute([
                ":name"=>$name,
                ":type"=>$type,
                ":build"=>$build
            ]);

            $changelogId=$this->pdo->lastInsertId();

            //Changes
            $sentence=
                "INSERT INTO changes(textContent, type, changelog)
                VALUES(:textContent, :type, :changelog)";

            $execution=$this->pdo->prepare($sentence);

            foreach($changes as $change){

                $text=trim($change["text"]);
                $cType=$change["type"];

                if($text=="") continue;

                $execution->execute([
                    ":textContent"=>$text,
                    ":type"=>$cType,
                    ":changelog"=>$changelogId
                ]);
            }

            $this->pdo->commit();

            return true;

        }catch(Exception $e){

            $this->pdo->rollBack();
            return false;
        }
    }


    //Returns news ordered by newest first
    function getNews($isAdmin){

        try{

            $sentence=
                "SELECT *
                FROM news
                ORDER BY date DESC";

            if(!$isAdmin){

                $sentence.=" LIMIT 15";

            }

            $execution=$this->pdo->prepare($sentence);
            $execution->execute();

            return $execution->fetchAll(PDO::FETCH_ASSOC);

        }catch(Exception $e){

            return false;

        }

    }


    //Inserts a news on db
    function insertNews($title, $textContent){

        try{

            $sentence=
                "INSERT INTO news(title, textContent)
                VALUES(:title, :textContent)";

            $execution=$this->pdo->prepare($sentence);

            return $execution->execute([

                ":title"=>$title,
                ":textContent"=>$textContent

            ]);

        }catch(Exception $e){

            return false;

        }

    }


    //Deletes a news by id
    function deleteNews($newsId){

        try{

            $sentence=
                "DELETE FROM news
                WHERE news_id=:id";

            $execution=$this->pdo->prepare($sentence);

            return $execution->execute([

                ":id"=>$newsId

            ]);

        }catch(Exception $e){

            return false;

        }

    }


    //Inserts an user in the database
    function insertUser($name, $email, $pass){
        
        $sentence="INSERT INTO users(name, email, pass) VALUES(:name, :email, :pass)";
        $execution=$this->pdo->prepare($sentence);
        $execution->execute(

            array(

                ":name"=>$name,
                ":email"=>$email,
                ":pass"=>$pass

            )

        );
        
        return true;

    }


    //Uploads an asset in the db
        function insertAsset(
        $name,
        $category,
        $userId,
        $value=0,
        $cost=0,
        $description="",
        $type=0,
        $health=0,
        $damage=0,
        $defense=0,
        $speed=0
    ){

        $sentence=

            "INSERT INTO assets
            (
                name,
                category,
                author,
                value,
                cost,
                description,
                type,
                health,
                damage,
                defense,
                speed
            )

            VALUES
            (
                :name,
                :category,
                :author,
                :value,
                :cost,
                :description,
                :type,
                :health,
                :damage,
                :defense,
                :speed
            )";

        $execution=$this->pdo->prepare($sentence);

        $res=$execution->execute(

            array(

                ":name" => $name,
                ":category" => $category,
                ":author" => $userId,
                ":value" => $value,
                ":cost" => $cost,
                ":description" => $description,
                ":type" => $type,
                ":health" => $health,
                ":damage" => $damage,
                ":defense" => $defense,
                ":speed" => $speed

            )

        );

        if(!$res) return false;

        return $this->pdo->lastInsertId();

    }


    //Uploads a file in the db
    function insertFile($newFileName,$image,$asset_Id){

        $sentence="INSERT INTO files(name, image, asset_id) VALUES(:name, :image, :asset_Id)";
        $execution=$this->pdo->prepare($sentence);
        $execution->execute(

            array(

                ":name"=>$newFileName,
                ":image"=>$image,
                ":asset_Id"=>$asset_Id

            )

        );
        
        return true;

    }


    //Checks if a password is right
    function checkPassword($id, $pass){

        $sentence="SELECT pass FROM users WHERE users_id=:id";
        $execution=$this->pdo->prepare($sentence);
        $execution->execute(

            array(

                ":id"=>$id

            )

        );

        $resp=$execution->fetch(PDO::FETCH_ASSOC);
        
        return password_verify($pass, $resp["pass"]);

    }


}

?>