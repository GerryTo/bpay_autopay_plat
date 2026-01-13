import { AppShell, Burger, Flex, Group, Skeleton, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import HeaderSection from "../components/header";
import NavigationSection from "../components/navbar";
import { filterRoutesByRole, mockdataRoutes } from "../routes";
import { Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Home() {
    const [opened, { toggle }] = useDisclosure();
    const loginUser = useSelector((state) => state.loginUser);
    const loginUserType =
        loginUser?.type ??
        loginUser?.userType ??
        loginUser?.usertype ??
        loginUser?.role;
    const filteredRoutes = filterRoutesByRole(mockdataRoutes, loginUserType);
    const renderRoutes = (item) => {
        return item?.map((dt, i) =>
            dt.links ? (
                renderRoutes(dt.links)
            ) : (
                <Route key={i} path={dt.link} element={dt.element} />
            )
        );
    };
    return (
        <AppShell
            layout="alt"
            header={{ height: 60 }}
            footer={{ height: 60 }}
            navbar={{
                width: 260,
                breakpoint: "sm",
                collapsed: { mobile: !opened },
                padding: 0,
            }}
            padding="md"
        >
            <AppShell.Header>
                <HeaderSection opened={opened} toggle={toggle} />
            </AppShell.Header>
            <AppShell.Navbar>
                <NavigationSection opened={opened} toggle={toggle} />
            </AppShell.Navbar>

            <AppShell.Main>
                <Routes>{renderRoutes(filteredRoutes)}</Routes>
            </AppShell.Main>
        </AppShell>
    );
}
