import {
    IconBook,
    IconCalendarEvent,
    IconCompass,
    IconHeadset,
    IconHeart,
    IconHelp,
    IconLayoutDashboard,
    IconQuestionMark,
    IconSchool,
    IconTrophy,
    IconUsers,
    IconUsersGroup,
} from "@tabler/icons-react";
import Dashboard from "./layouts/dashboardPage";

export const mockdataRoutes = [
    // {
    //     label: "Dashboard",
    //     icon: "",
    //     initiallyOpened: true,
    //     link: "/",
    //     element: <Dashboard />,
    // },
    // {
    //     label: "Dashboard",
    //     icon: "",
    //     links: [
    //         {
    //             label: "Master",
    //             link: "/master",
    //             element: "",
    //         },
    //     ],
    // },
    {
        title: "General",
        links: [
            {
                label: "Overview",
                icon: <IconLayoutDashboard />,
                link: "/overview",
                // initiallyOpened: true,
                element: "",
                links: [
                    {
                        label: "Master",
                        icon: <IconCompass />,
                        links: [
                            {
                                label: "Master",
                                icon: <IconBook />,
                                link: "/master",
                                element: "",
                            },
                        ],
                    },
                    {
                        label: "Overview",
                        icon: <IconLayoutDashboard />,
                        link: "/overview",
                        element: <Dashboard />,
                    },
                ],
            },
            {
                label: "Explore",
                icon: <IconCompass />,
                link: "/explore",
                element: "",
            },
            {
                label: "My Courses",
                icon: <IconBook />,
                link: "/my-courses",
                element: "",
            },
            {
                label: "Favorite",
                icon: <IconHeart />,
                link: "/favorite",
                element: "",
            },
        ],
    },
    {
        title: "Mentors",
        links: [
            {
                label: "Top",
                icon: <IconTrophy />,
                link: "/mentors/top",
                element: "",
            },
            {
                label: "Followed",
                icon: <IconUsers />,
                link: "/mentors/followed",
                element: "",
            },
        ],
    },
    {
        title: "Community",
        links: [
            {
                label: "Forums",
                icon: <IconUsers />,
                link: "/forums",
                element: "",
            },
            {
                label: "Events",
                icon: <IconCalendarEvent />,
                link: "/events",
                element: "",
            },
            {
                label: "Meetups",
                icon: <IconUsersGroup />,
                link: "/meetups",
                element: "",
            },
        ],
    },
    {
        title: "Resources",
        links: [
            {
                label: "Tutorials",
                icon: <IconSchool />,
                link: "/tutorials",
                element: "",
            },
            {
                label: "FAQ",
                icon: <IconQuestionMark />,
                link: "/faq",
                element: "",
            },
        ],
    },
    {
        title: "Support",
        links: [
            {
                label: "Contact Support",
                icon: <IconHelp />,
                link: "/support",
                element: "",
            },
            {
                label: "Help Center",
                icon: <IconHeadset />,
                link: "/help",
                element: "",
            },
        ],
    },
];
