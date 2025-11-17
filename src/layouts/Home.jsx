import { AppShell, Burger, Flex, Group, Skeleton, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import HeaderSection from "../components/header";
import NavigationSection from "../components/navbar";
import { mockdataRoutes } from "../routes";
import { Route, Routes } from "react-router-dom";

export default function Home() {
    const [opened, { toggle }] = useDisclosure();
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
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !opened },
                padding: "xl",
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
                <Routes>{renderRoutes(mockdataRoutes)}</Routes>
            </AppShell.Main>
        </AppShell>
    );
}
