import { notifications } from "@mantine/notifications";

export function showNotification({
    title = "Success",
    message,
    autoClose = 5000,
    withCloseButton = true,
    Color = "green",
    color,
}) {
    const resolvedColor = color || Color || "green";
    notifications.show({
        title: title,
        message: message,
        autoClose: autoClose,
        withCloseButton: withCloseButton,
        styles: (theme) => ({
            root: {
                // backgroundColor: theme.colors[backgroundColor][6],
                // borderColor: theme.colors[borderColor][6],
                "&::before": { backgroundColor: theme.white },
                "--notification-color": theme.colors[resolvedColor][6],
            },
            title: { color: theme.black },
            description: { color: theme.gray },
            closeButton: {
                color: theme.white,
                "&:hover": {
                    backgroundColor: theme.colors[resolvedColor][7],
                },
            },
        }),
    });
}
