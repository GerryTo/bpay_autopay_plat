import {
  Anchor,
  Breadcrumbs,
  Burger,
  Flex,
  Group,
  Image,
  Stack,
  Text,
} from '@mantine/core';
import logo from '../../assets/C_logo.png';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const HeaderSection = ({ opened, toggle }) => {
  const breadcrumbState = useSelector((state) => state.textBreadCrumb);
  const navigate = useNavigate();
  const { breadcrumbs = [] } = breadcrumbState;

  const items = breadcrumbs.map((item, index) => {
    const isLast = index === breadcrumbs.length - 1;

    if (item.isSection) {
      return (
        <Text
          key={index}
          size="xs"
          c="dimmed"
          tt="uppercase"
          fw={600}
        >
          {item.label}
        </Text>
      );
    }

    if (isLast || !item.link) {
      return (
        <Text
          key={index}
          size="xs"
          fw={500}
        >
          {item.label}
        </Text>
      );
    }

    return (
      <Anchor
        key={index}
        size="xs"
        onClick={(e) => {
          e.preventDefault();
          navigate(item.link);
        }}
      >
        {item.label}
      </Anchor>
    );
  });
  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        px="md"
        py="xs"
        hiddenFrom="sm"
      >
        <Group>
          <Image
            src={logo}
            alt="Logo"
            fit="contain"
            h={40}
            w={40}
          />
          <Text
            size="xl"
            fw={700}
            c="dark"
          >
            New Platform
          </Text>
        </Group>
        <Burger
          opened={opened}
          onClick={toggle}
          size="sm"
        />
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        px="md"
        py="xs"
        visibleFrom="sm"
        h={50}
        w="auto"
      >
        <Stack gap={5}>
          <Text
            size="xl"
            fw={700}
            c="dark"
            tt="uppercase"
          >
            {breadcrumbState.activeLabel}
          </Text>
          <Breadcrumbs
            separator="/"
            separatorMargin="md"
          >
            {items}
          </Breadcrumbs>
        </Stack>
      </Flex>
    </>
  );
};

export default HeaderSection;
