import {
    Button,
    Checkbox,
    Flex,
    Image,
    Paper,
    PasswordInput,
    TextInput,
    Title,
} from "@mantine/core";
import classes from "../../styles/login.module.css";
import logo from "../../assets/logo_comm.png";
import LoginData from "./data/login-data";

const Login = () => {
    let { handleLogin, setPassword, setUsername, password, username, loading } =
        LoginData();
    return (
        <Flex h={"100%"}>
            <Paper className={classes.form}>
                <Title order={2} className={classes.title}>
                    Welcome back to New Platform!
                </Title>

                <TextInput
                    label="Username"
                    placeholder="put the username"
                    size="md"
                    radius="md"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                />
                <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    mt="md"
                    size="md"
                    radius="md"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                />
                <Checkbox label="Keep me logged in" mt="xl" size="md" />
                <Button
                    fullWidth
                    mt="xl"
                    size="md"
                    radius="md"
                    onClick={handleLogin}
                    loading={loading}
                >
                    Login
                </Button>
            </Paper>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <Image src={logo} height={400} fit="contain" />
            </div>
        </Flex>
    );
};

export default Login;
