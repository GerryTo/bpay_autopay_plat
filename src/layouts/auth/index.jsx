import {
  Anchor,
  Button,
  Checkbox,
  Image,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Flex,
} from '@mantine/core';
import { useState } from 'react';
import classes from '../../styles/login.module.css';
import LoginData from './data/login-data';

const Login = () => {
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  let {
    handleLogin,
    setPassword,
    setUsername,
    password,
    username,
    loading,
  } = LoginData({ keepLoggedIn });

  return (
    <div className={classes.wrapper}>
      <div className={classes.glowOne}></div>
      <div className={classes.glowTwo}></div>

      <div className={classes.content}>
        <Paper
          className={classes.formCard}
          radius="xl"
          shadow="xl"
          withBorder
        >
          <Title
            order={3}
            className={classes.formTitle}
          >
            Welcome back
          </Title>
          <Text className={classes.formSubtitle}>
            Enter your details to continue to your dashboard.
          </Text>

          <TextInput
            label="Username"
            placeholder="Enter your username"
            size="md"
            radius="md"
            variant="filled"
            mt="lg"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            mt="md"
            size="md"
            radius="md"
            variant="filled"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />

          <Flex
            align="center"
            justify="space-between"
            mt="md"
          >
          <Checkbox
            label="Keep me logged in"
            size="sm"
            color="cyan"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.currentTarget.checked)}
          />
            <Anchor
              component="button"
              size="sm"
              className={classes.link}
            >
              Forgot password?
            </Anchor>
          </Flex>

          <Button
            fullWidth
            mt="xl"
            size="md"
            radius="md"
            onClick={handleLogin}
            loading={loading}
            className={classes.submit}
          >
            Sign in
          </Button>
        </Paper>

        <div className={classes.hero}>
          <div className={classes.brand}>
            <div className={classes.brandIcon}>
              <Image
                src="/bluegp.png"
                alt="BlueGP icon"
                fit="contain"
                className={classes.brandImg}
              />
            </div>
            <div>
              <Text className={classes.brandName}>BlueOrange</Text>
              <Text className={classes.brandTagline}>
                Payment gateway platform
              </Text>
            </div>
          </div>

          <Title className={classes.heroTitle}>
            Sign in to keep your payments flowing
          </Title>
          <Text className={classes.heroSubtitle}>
            Stay on top of every transaction, automate collections, and keep
            your customers cared for—all from one clear, calm workspace.
          </Text>
          <Stack
            gap={10}
            mt={18}
          >
            <div className={classes.heroChip}>Realtime status</div>
            <div className={classes.heroChip}>Smart retry logic</div>
            <div className={classes.heroChip}>Multi-layer security</div>
          </Stack>
        </div>
      </div>
    </div>
  );
};

export default Login;
