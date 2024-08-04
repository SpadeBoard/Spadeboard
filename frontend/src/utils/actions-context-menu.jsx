import { ContextMenuTrigger, ContextMenu, ContextMenuItem } from '@kongkiat/react-context-menu';
import React, { useState } from "react";

import './actions-context-menu.css';

const ActionsContextMenu = (props) => {
    const [contextMenuDisplay, setContextMenuDisplay] = useState("none");

    return (
        <span className='actions-context-menu'>
            <ContextMenuTrigger
                id={`${props.contextMenuItemsId}-context-menu`} >
                <div id={`${props.contextMenuItemsId}-context-menu-trigger`} style={{ visibility: "hidden" }} onContextMenu={(e) => {
                    setContextMenuDisplay("block");
                }}>
                    REVEAL CONTEXT MENU
                </div>
            </ContextMenuTrigger>
            {/*ContextMenu isn't being hidden for some reason, might be better to just do a custom context menu instead of using one*/}
            <ContextMenu id={`${props.contextMenuItemsId}-context-menu`} style={{ visibility: "hidden" /*{ contextMenuDisplay }*/ }}>
                {props.contextMenuItems.map(contextMenuItem => (
                    <ContextMenuItem disabled={contextMenuItem.disabled || false} onClick={() => contextMenuItem.onClick}>
                        {contextMenuItem.name}
                    </ContextMenuItem>))}
            </ContextMenu>
        </span>
    )
}

export default ActionsContextMenu;