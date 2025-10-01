import React from 'react'
import HomeIcon from '@mui/icons-material/Home';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import StorageIcon from '@mui/icons-material/Storage';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TerminalIcon from '@mui/icons-material/Terminal';

export const SidebarData = [
    {
        title: "Нүүр хуудас",
        icon: <HomeIcon />,
        link: "/home"
    }, 
    {
        title: "Зангилаа",
        icon: <DeveloperBoardIcon />,
        link: "/nodes"
    }, 
    {
        title: "Лог",
        icon: <StorageIcon />,
        link: "/log"
    }, 
    {
        title: "Статистик",
        icon: <ShowChartIcon />,
        link: "/statistic"
    }, 
    {
        title: "Команд лог",
        icon: <TerminalIcon />,
        link: "/cmdlog"
    }, 
    {
        title: "Хэрэглэгч",
        icon: <SupervisorAccountIcon />,
        link: "/users"
    }, 
]