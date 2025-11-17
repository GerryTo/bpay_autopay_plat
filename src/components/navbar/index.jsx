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
} from "@mantine/core";
import { IconLogout, IconChevronDown } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { mockdataRoutes } from "../../routes";
import logo from "../../assets/C_logo.png";
import { useDispatch, useSelector } from "react-redux";
import { addBreadcrumbs } from "../../reducers/userReducer";
import Cookies from "js-cookie";
import { showNotification } from "../../helper/showNotification";

const NavigationSection = ({ opened, toggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const breadcrumbState = useSelector((state) => state.textBreadCrumb);
    const activeLink = breadcrumbState.activeLink || location.pathname;
    const [openedLinks, setOpenedLinks] = useState({});

    function handleLogout() {
        try {
            Cookies.remove("loginUser");
            Cookies.remove("ADD_BREADCRUMBS");
            localStorage.removeItem("token");

            dispatch({
                type: "LOGOUT",
            });

            dispatch({
                type: "RESET_BREADCRUMBS",
            });

            showNotification({
                title: "Logout Success",
                message: "You have been logged out successfully",
                color: "blue",
            });

            navigate("/auth/login");
        } catch (e) {
            showNotification({
                title: "Logout Failed",
                message: "Something went wrong",
                color: "red",
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
                        { label: item.label, icon: item.icon }
                    );
                    if (found) return found;
                }
            }
        }
        return null;
    };

    useEffect(() => {
        const navInfo = findNavigationItem(mockdataRoutes, location.pathname);
        if (navInfo) {
            const breadcrumbs = buildBreadcrumbs(navInfo);
            dispatch(
                addBreadcrumbs({
                    link: location.pathname,
                    label: navInfo.item.label,
                    breadcrumbs,
                    parentSection: navInfo.section,
                })
            );
        }
    }, [location.pathname, dispatch]);

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
        const navInfo = findNavigationItem(mockdataRoutes, link);
        if (navInfo) {
            const breadcrumbs = buildBreadcrumbs(navInfo);
            dispatch(
                addBreadcrumbs({
                    link,
                    label,
                    breadcrumbs,
                    parentSection: navInfo.section,
                })
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

    const renderNavLink = (item, nested = false) => {
        const hasChildren = item.links && item.links.length > 0;
        let iconClone = null;
        if (React.isValidElement(item.icon)) {
            iconClone = React.cloneElement(item.icon, { size: "1.1rem" });
        }
        const isOpened = openedLinks[item.label] || item.initiallyOpened;

        if (hasChildren) {
            return (
                <Box key={item.label}>
                    <NavLink
                        label={item.label}
                        leftSection={
                            <ThemeIcon variant="subtle" color="gray" size="md">
                                {iconClone}
                            </ThemeIcon>
                        }
                        rightSection={
                            <IconChevronDown
                                size="1rem"
                                style={{
                                    transform: isOpened
                                        ? "rotate(0deg)"
                                        : "rotate(-90deg)",
                                    transition: "transform 200ms",
                                }}
                            />
                        }
                        onClick={() => toggleCollapse(item.label)}
                        variant="subtle"
                        styles={{
                            root: {
                                borderRadius: "8px",
                                padding: "8px 12px",
                                "&:hover": {
                                    backgroundColor:
                                        "var(--mantine-color-gray-0)",
                                },
                            },
                            label: {
                                fontSize: "14px",
                                fontWeight: 400,
                            },
                        }}
                    />
                    <Collapse in={isOpened}>
                        <Stack gap={2} ml="md" mt={4}>
                            {item.links.map((child) =>
                                renderNavLink(child, true)
                            )}
                        </Stack>
                    </Collapse>
                </Box>
            );
        }
        return (
            <NavLink
                key={item.link}
                label={item.label}
                leftSection={
                    <ThemeIcon
                        variant={activeLink === item.link ? "light" : "subtle"}
                        color={activeLink === item.link ? "blue" : "gray"}
                        size="md"
                    >
                        {iconClone}
                    </ThemeIcon>
                }
                onClick={() => handleNavClick(item.link)}
                active={activeLink === item.link}
                variant="subtle"
                styles={{
                    root: {
                        borderRadius: "8px",
                        padding: nested ? "6px 12px" : "8px 12px",
                        "&:hover": {
                            backgroundColor: "var(--mantine-color-gray-0)",
                        },
                    },
                    label: {
                        fontSize: nested ? "13px" : "14px",
                        fontWeight: activeLink === item.link ? 600 : 400,
                    },
                }}
            />
        );
    };

    return (
        <Box h="100%">
            <ScrollArea h="100%" type="never">
                <Stack gap="lg" p="md">
                    <Group gap="xs" px="md" justify="space-between">
                        <Group>
                            <Image
                                src={logo}
                                alt="Logo"
                                fit="contain"
                                h={60}
                                w={60}
                            />
                            <Text size="xl" fw={700} c="dark">
                                New Platform
                            </Text>
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
                                    {mockdataRoutes.map((item) =>
                                        renderNavLink(item)
                                    )}
                                </Stack>
                            </Box>
                            <Divider />
                        </>
                    )} */}

                    {mockdataRoutes.map((dt, i) => (
                        <Box key={dt.title}>
                            <Text
                                size="xs"
                                c="dimmed"
                                px="md"
                                mb="xs"
                                tt="uppercase"
                                fw={600}
                            >
                                {dt.title}
                            </Text>
                            <Stack gap={4}>
                                {dt.links.map((dt) => renderNavLink(dt))}
                            </Stack>
                            {i < mockdataRoutes.length - 1 && (
                                <Divider mt="md" />
                            )}
                        </Box>
                    ))}

                    <Divider />

                    {/* Log Out */}
                    <Box mt="auto">
                        <NavLink
                            label="Log Out"
                            leftSection={
                                <ThemeIcon
                                    variant="subtle"
                                    color="gray"
                                    size="md"
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
                                    borderRadius: "8px",
                                    padding: "8px 12px",
                                    "&:hover": {
                                        backgroundColor:
                                            "var(--mantine-color-gray-0)",
                                    },
                                },
                                label: {
                                    fontSize: "14px",
                                    fontWeight: 400,
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
