<?php

// session_start();
//include_once __DIR__ . "/../global_function.php";

class Auth
{
    private $connection = null;

    public function __construct($conn)
    {
        $this->connection = $conn;
    }

    #region appium
    public function LoginAppium($username = null, $password = null)
    {
        try {
            if (empty($username) || empty($password)) throw new Exception('Invalid Username or Password');

            $query = "SELECT * FROM ms_login_appium WHERE v_username = ? AND v_password = ? AND v_system = 'AUTOMATION' ";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $username, PDO::PARAM_STR);
            $stmt->bindValue(2, sha1($password), PDO::PARAM_STR);
            $stmt->execute();
            $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $res;
            $stmt = null;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function SetTokenAppium($username, $token = '')
    {
        try {
            if (empty($username)) throw new Exception('Invalid Username');

            $query = "UPDATE ms_login_appium SET v_token = ? WHERE v_username = ? AND v_system = 'AUTOMATION'";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $token, PDO::PARAM_STR);
            $stmt->bindValue(2, $username, PDO::PARAM_STR);
            $stmt->execute();

            $stmt = null;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function GetUserAppium($token)
    {
        try {

            $query = "SELECT * FROM ms_login_appium WHERE v_token = ? AND v_system = 'AUTOMATION'";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $token, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() > 0) return $stmt->fetch(PDO::FETCH_ASSOC);
            else return false;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function GetMainUser($user)
    {
        try {
            $query = "SELECT * FROM ms_login WHERE v_user = ?";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $user, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() > 0) return $stmt->fetch(PDO::FETCH_ASSOC);
            else return false;
        } catch (Exception $e) {
            throw $e;
        }
    }
    #endregion

    #region otp setter
    public function LoginOtpSetter($username, $password)
    {
        try {
            if (empty($username) || empty($password)) throw new Exception('Invalid Username or Password');

            $query = "SELECT * FROM ms_login WHERE v_user = ? AND v_password = ? AND v_active = 'Y' ";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $username, PDO::PARAM_STR);
            $stmt->bindValue(2, sha1($password), PDO::PARAM_STR);
            $stmt->execute();
            $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $res;
            $stmt = null;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function SetTokenOtpSetter($username = null, $token = '')
    {
        try {
            if (empty($username)) throw new Exception('Invalid Username');

            $query = "UPDATE ms_login SET v_token_otpsetter = ? WHERE v_user = ?";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $token, PDO::PARAM_STR);
            $stmt->bindValue(2, $username, PDO::PARAM_STR);
            $stmt->execute();

            $stmt = null;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function SetUserBankPin($username, $bank, $userBank, $pin)
    {
        try {
            if (empty($username)) throw new Exception('Invalid Username');

            $query = "UPDATE ms_login SET v_bank = ?, v_userbank =?, v_pin = ? WHERE v_user = ?";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $bank, PDO::PARAM_STR);
            $stmt->bindValue(2, $userBank, PDO::PARAM_STR);
            $stmt->bindValue(3, $pin, PDO::PARAM_STR);
            $stmt->bindValue(4, $username, PDO::PARAM_STR);
            $stmt->execute();

            $stmt = null;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function SetUserBankPinV2($username, $bank, $userBank, $pin = null, $pinBkash = null, $email = null, $passwordBkash = null)
    {
        try {
            if (empty($username)) throw new Exception('Invalid Username');

            $query = "UPDATE ms_login SET v_bank = ?, v_userbank =?, v_pin = ? , v_bkash_pin = ?, v_email = ?, v_password_bkash = ? WHERE v_user = ?";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $bank, PDO::PARAM_STR);
            $stmt->bindValue(2, $userBank, PDO::PARAM_STR);
            $stmt->bindValue(3, $pin, PDO::PARAM_STR);
            $stmt->bindValue(4, $pinBkash, PDO::PARAM_STR);
            $stmt->bindValue(5, $email, PDO::PARAM_STR);
            $stmt->bindValue(6, $passwordBkash, PDO::PARAM_STR);
            $stmt->bindValue(7, $username, PDO::PARAM_STR);
            $stmt->execute();

            $stmt = null;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function GetUserOtpSetter($token)
    {
        try {

            $query = "SELECT * FROM ms_login WHERE v_token_otpsetter = ? AND v_active = 'Y'";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $token, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() > 0) return $stmt->fetch(PDO::FETCH_ASSOC);
            else return false;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function SetServerName($serverName = null, $username)
    {
        try {
            $query = "UPDATE ms_login_appium SET v_servername = ? WHERE v_username = ?";
            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $serverName, PDO::PARAM_STR);
            $stmt->bindValue(2, $username, PDO::PARAM_STR);
            $stmt->execute();

            $stmt = null;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function setSerialNumber($serialNumber = null, $username)
    {
        try {
            $query = "UPDATE ms_login_appium SET v_serialnumber = ? WHERE v_username = ?";
            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $serialNumber, PDO::PARAM_STR);
            $stmt->bindValue(2, $username, PDO::PARAM_STR);
            $stmt->execute();

            $stmt = null;
        } catch (Exception $e) {
            throw $e;
        }
    }

    #endregion

    #region com getter
    public function LoginComGetter($username = null, $password = null)
    {
        try {
            if (empty($username) || empty($password)) throw new Exception('Invalid Username or Password');

            $query = "SELECT * FROM ms_login_appium WHERE v_username = ? AND v_password = ? AND v_system = 'COM GETTER' ";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $username, PDO::PARAM_STR);
            $stmt->bindValue(2, sha1($password), PDO::PARAM_STR);
            $stmt->execute();
            $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $res;
            $stmt = null;
        } catch (Exception $e) {
            throw $e;
        }
    }


    public function SetTokenComGetter($username = null, $token = '')
    {
        try {
            if (empty($username)) throw new Exception('Invalid Username');

            $query = "UPDATE ms_login_appium SET v_token = ? WHERE v_username = ? AND v_system = 'COM GETTER'";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $token, PDO::PARAM_STR);
            $stmt->bindValue(2, $username, PDO::PARAM_STR);
            $stmt->execute();

            $stmt = null;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function GetUserComGetter($token)
    {
        try {

            $query = "SELECT * FROM ms_login_appium WHERE v_token = ? AND v_system = 'COM GETTER'";

            $stmt = $this->connection->prepare($query);
            $stmt->bindValue(1, $token, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() > 0) return $stmt->fetch(PDO::FETCH_ASSOC);
            else return false;
        } catch (Exception $e) {
            throw $e;
        }
    }

    #endregion
}
