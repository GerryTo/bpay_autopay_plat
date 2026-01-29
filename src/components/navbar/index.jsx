import {
  Box,
  NavLink,
  Text,
  Group,
  Stack,
  ThemeIcon,
  Divider,
  ScrollArea,
  Collapse,
  Burger,
  Image,
  Badge,
  Tooltip,
} from '@mantine/core';
import { IconLogout, IconChevronDown } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { filterRoutesByRole, mockdataRoutes } from '../../routes';
import logo from '../../assets/C_logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { addBreadcrumbs } from '../../reducers/userReducer';
import Cookies from 'js-cookie';
import { showNotification } from '../../helper/showNotification';

const NavigationSection = ({ opened, toggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const breadcrumbState = useSelector((state) => state.textBreadCrumb);
  const loginUser = useSelector((state) => state.loginUser);
  const activeLink = breadcrumbState.activeLink || location.pathname;
  const [openedLinks, setOpenedLinks] = useState({});
  const [openedSections, setOpenedSections] = useState({});
  const loginUserType =
    loginUser?.type ??
    loginUser?.userType ??
    loginUser?.usertype ??
    loginUser?.role;
  const filteredRoutes = useMemo(
    () => filterRoutesByRole(mockdataRoutes, loginUserType),
    [loginUserType],
  );

  function handleLogout() {
    try {
      Cookies.remove('loginUser', { path: '/' });
      Cookies.remove('loginUser', { path: '/auth' });
      Cookies.remove('ADD_BREADCRUMBS', { path: '/' });
      Cookies.remove('ADD_BREADCRUMBS', { path: '/auth' });
      localStorage.removeItem('token');
      localStorage.removeItem('loginUser');

      dispatch({
        type: 'LOGOUT',
      });

      dispatch({
        type: 'RESET_BREADCRUMBS',
      });

      showNotification({
        title: 'Logout Success',
        message: 'You have been logged out successfully',
        color: 'blue',
      });

      navigate('/auth/login');
    } catch (e) {
      console.error(e);
      showNotification({
        title: 'Logout Failed',
        message: 'Something went wrong',
        color: 'red',
      });
    }
  }

  const findNavigationItem = (routes, targetLink, parentInfo = null) => {
    for (const section of routes) {
      for (const item of section.links) {
        if (item.link === targetLink) {
          return {
            item,
            section: section.title,
            parent: parentInfo,
          };
        }

        if (item.links && item.links.length > 0) {
          const found = findNavigationItem(
            [{ title: section.title, links: item.links }],
            targetLink,
            { label: item.label, icon: item.icon },
          );
          if (found) return found;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const navInfo = findNavigationItem(filteredRoutes, location.pathname);
    if (navInfo) {
      const breadcrumbs = buildBreadcrumbs(navInfo);
      dispatch(
        addBreadcrumbs({
          link: location.pathname,
          label: navInfo.item.label,
          breadcrumbs,
          parentSection: navInfo.section,
        }),
      );
    }
  }, [location.pathname, dispatch, filteredRoutes]);

  const buildBreadcrumbs = (navInfo) => {
    const breadcrumbs = [];

    // Add section
    if (navInfo.section) {
      breadcrumbs.push({
        label: navInfo.section,
        link: null,
        isSection: true,
      });
    }

    // Add parent if exists
    if (navInfo.parent) {
      breadcrumbs.push({
        label: navInfo.parent.label,
        link: null,
        icon: navInfo.parent.icon,
      });
    }

    // Add current item
    breadcrumbs.push({
      label: navInfo.item.label,
      link: navInfo.item.link,
      icon: navInfo.item.icon,
    });

    return breadcrumbs;
  };

  const handleNavClick = (link, label) => {
    const navInfo = findNavigationItem(filteredRoutes, link);
    if (navInfo) {
      const breadcrumbs = buildBreadcrumbs(navInfo);
      dispatch(
        addBreadcrumbs({
          link,
          label,
          breadcrumbs,
          parentSection: navInfo.section,
        }),
      );
    }

    navigate(link);

    // Close mobile menu after navigation
    if (window.innerWidth < 768 && opened) {
      toggle();
    }
  };

  const toggleCollapse = (label) => {
    setOpenedLinks((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const toggleSection = (sectionTitle) => {
    setOpenedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const renderNavLink = (item, nested = false) => {
    const hasChildren = item.links && item.links.length > 0;
    let iconClone = null;
    if (React.isValidElement(item.icon)) {
      iconClone = React.cloneElement(item.icon, {
        size: nested ? '1rem' : '1.1rem',
      });
    }
    const isOpened = openedLinks[item.label] || item.initiallyOpened;

    if (hasChildren) {
      const childCount = item.links.length;
      return (
        <Box key={item.label}>
          <NavLink
            label={
              <Group
                gap="xs"
                justify="space-between"
                style={{ width: '100%' }}
              >
                <Text
                  size="sm"
                  style={{
                    fontWeight: 400,
                    color: '#212529',
                  }}
                >
                  {item.label}
                </Text>
                <Badge
                  size="sm"
                  variant={isOpened ? 'light' : 'outline'}
                  color={isOpened ? 'blue' : 'gray'}
                  style={{
                    fontWeight: 500,
                    minWidth: '26px',
                    height: '18px',
                    paddingLeft: '6px',
                    paddingRight: '6px',
                    fontSize: '10px',
                  }}
                >
                  {childCount}
                </Badge>
              </Group>
            }
            leftSection={
              <ThemeIcon
                variant="subtle"
                color={isOpened ? 'blue' : 'gray'}
                size="md"
                style={{
                  color: isOpened ? '#228be6' : '#868e96',
                }}
              >
                {iconClone}
              </ThemeIcon>
            }
            rightSection={
              <IconChevronDown
                size="0.95rem"
                style={{
                  transform: isOpened ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 200ms ease',
                  color: '#868e96',
                }}
              />
            }
            onClick={() => toggleCollapse(item.label)}
            variant="subtle"
            styles={{
              root: {
                borderRadius: '8px',
                padding: '8px 10px',
                transition: 'all 150ms ease',
                '&:hover': {
                  backgroundColor: 'var(--mantine-color-gray-0)',
                  transform: 'translateX(2px)',
                },
              },
              label: {
                fontSize: '14px',
                fontWeight: 400,
                width: '100%',
              },
            }}
          />
          <Collapse in={isOpened}>
            <Stack
              gap={2}
              ml="lg"
              mt={4}
              pl="xs"
              style={{
                borderLeft: '2px solid var(--mantine-color-gray-2)',
              }}
            >
              {item.links.map((child) => renderNavLink(child, true))}
            </Stack>
          </Collapse>
        </Box>
      );
    }
    return (
      <Tooltip
        label={item.label}
        position="right"
        withArrow
        disabled={item.label.length < 30}
      >
        <NavLink
          key={item.link}
          label={item.label}
          leftSection={
            <ThemeIcon
              variant={activeLink === item.link ? 'light' : 'subtle'}
              color={activeLink === item.link ? 'blue' : 'gray'}
              size={nested ? 'sm' : 'md'}
              style={{
                color: activeLink === item.link ? '#228be6' : '#868e96',
              }}
            >
              {iconClone}
            </ThemeIcon>
          }
          onClick={() => handleNavClick(item.link)}
          active={activeLink === item.link}
          variant="subtle"
          styles={{
            root: {
              borderRadius: '8px',
              padding: nested ? '6px 10px' : '8px 10px',
              transition: 'all 150ms ease',
              '&:hover': {
                backgroundColor:
                  activeLink === item.link
                    ? 'rgba(34, 139, 230, 0.12)'
                    : 'var(--mantine-color-gray-0)',
                transform: 'translateX(2px)',
              },
              backgroundColor:
                activeLink === item.link
                  ? 'rgba(34, 139, 230, 0.08)'
                  : 'transparent',
            },
            label: {
              fontSize: nested ? '13px' : '14px',
              fontWeight: activeLink === item.link ? 500 : 400,
              color: activeLink === item.link ? '#228be6' : '#212529',
            },
          }}
        />
      </Tooltip>
    );
  };

  return (
    <Box
      h="100%"
      style={{
        backgroundColor: 'rgb(217, 224, 232)',
      }}
    >
      <ScrollArea
        h="100%"
        type="auto"
        scrollbarSize={8}
        scrollHideDelay={500}
        styles={{
          scrollbar: {
            '&[data-orientation="vertical"]': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '4px',
            },
            '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
              },
            },
          },
        }}
      >
        <Stack
          gap="sm"
          p="xs"
          pb="sm"
        >
          <Group
            gap="sm"
            px="sm"
            py="xs"
            justify="space-between"
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-2)',
              marginBottom: '4px',
            }}
          >
            <Group gap="sm">
              <Image
                src={logo}
                alt="Logo"
                fit="contain"
                h={100}
                w={100}
              />
              <Stack gap={0}>
                <Text
                  size="lg"
                  fw={600}
                  style={{
                    color: '#212529',
                    lineHeight: 1.2,
                  }}
                >
                  Welcome
                </Text>
                <Text
                  size="sm"
                  fw={500}
                  style={{
                    color: '#495057',
                  }}
                >
                  {loginUser?.username || 'Guest'}
                </Text>
              </Stack>
            </Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
          </Group>

          {/* Dynamic Routes from mockdata */}
          {/* {mockdataRoutes.length > 0 && (
                        <>
                            <Box>
                                <Stack gap={4}>
                                    {mockdataRoutes
                                        .filter((item) => !item.hidden)
                                        .map((item) =>
                                        renderNavLink(item)
                                    )}
                                </Stack>
                            </Box>
                            <Divider />
                        </>
                    )} */}

          {filteredRoutes
            .filter((dt) => !dt.hidden) // Filter out hidden sections
            .map((dt, i) => {
              const isSectionOpen = openedSections[dt.title] === true;
              const menuCount = dt.links.length;
              return (
                <Box key={dt.title}>
                  <Tooltip
                    label={
                      isSectionOpen ? 'Click to collapse' : 'Click to expand'
                    }
                    position="right"
                    withArrow
                  >
                    <Group
                      gap="xs"
                      px="md"
                      mb="xs"
                      justify="space-between"
                      style={{
                        cursor: 'pointer',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        transition: 'all 200ms ease',
                      }}
                      onClick={() => toggleSection(dt.title)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          'var(--mantine-color-gray-1)';
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <Group gap="sm">
                        <Text
                          size="11px"
                          tt="uppercase"
                          fw={600}
                          style={{
                            letterSpacing: '0.5px',
                            color: '#495057',
                          }}
                        >
                          {dt.title}
                        </Text>
                        <Badge
                          size="sm"
                          variant="light"
                          color={isSectionOpen ? 'blue' : 'gray'}
                          style={{
                            fontWeight: 500,
                            minWidth: '28px',
                            height: '20px',
                            paddingLeft: '8px',
                            paddingRight: '8px',
                            fontSize: '11px',
                          }}
                        >
                          {menuCount}
                        </Badge>
                      </Group>
                      <IconChevronDown
                        size="1rem"
                        style={{
                          transform: isSectionOpen
                            ? 'rotate(0deg)'
                            : 'rotate(-90deg)',
                          transition: 'transform 200ms ease',
                          color: '#868e96',
                        }}
                      />
                    </Group>
                  </Tooltip>
                  <Collapse in={isSectionOpen}>
                    <Stack gap={2}>
                      {dt.links.map((dt) => renderNavLink(dt))}
                    </Stack>
                  </Collapse>
                  {i < filteredRoutes.filter((dt) => !dt.hidden).length - 1 && (
                    <Divider mt="sm" />
                  )}
                </Box>
              );
            })}

          {/* Log Out */}
          <Box
            mt="auto"
            pt="sm"
            style={{
              borderTop: '1px solid var(--mantine-color-gray-2)',
            }}
          >
            <NavLink
              label="Log Out"
              leftSection={
                <ThemeIcon
                  variant="subtle"
                  color="red"
                  size="md"
                  style={{
                    color: '#fa5252',
                  }}
                >
                  <IconLogout size="1.1rem" />
                </ThemeIcon>
              }
              onClick={() => {
                handleLogout();
              }}
              variant="subtle"
              styles={{
                root: {
                  borderRadius: '8px',
                  padding: '8px 10px',
                  transition: 'all 150ms ease',
                  '&:hover': {
                    backgroundColor: 'rgba(250, 82, 82, 0.08)',
                    transform: 'translateX(2px)',
                  },
                },
                label: {
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fa5252',
                },
              }}
            />
          </Box>
        </Stack>
      </ScrollArea>
    </Box>
  );
};

export default NavigationSection;
