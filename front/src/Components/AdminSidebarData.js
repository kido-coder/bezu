import React from 'react'
import HomeIcon from '@mui/icons-material/Home';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';

export const AdminSidebarData = [
    {
        title: "Нүүр хуудас",
        icon: <HomeIcon />,
        link: "/dashboard"
    },
    {
        title: "Хэрэглэгч",
        icon: <SupervisorAccountIcon />,
        link: "/users"
    },
    {
        title: "Лавлахууд",
        icon: <CollectionsBookmarkIcon />,
        link: "/dictionary"
    },
]