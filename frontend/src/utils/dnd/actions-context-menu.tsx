import React, { useState, useCallback } from 'react';
import { ActionContextMenuItem } from '../action-context-menu-item';

interface ActionsContextMenuProps {
    contextMenuItemsId: string;
    contextMenuItems?: ActionContextMenuItem[];
    // isContextMenuOpen: boolean; // Prop to control visibility
    setIsContextMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    zIndex: number;
}

const ActionsContextMenu: React.FC<ActionsContextMenuProps> = ({
    contextMenuItemsId,
    contextMenuItems,
    // isContextMenuOpen,
    setIsContextMenuOpen,
    zIndex
}) => {
    return (
        <>
            {/* Only show the context menu if isContextMenuOpen is true */}
            {(contextMenuItems) && (contextMenuItems?.length > 0) && (
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '110%',
                        transform: `translate(-50%, -50%)` ,
                        height: '10%',
                        backgroundColor: 'white',
                        boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
                        borderRadius: '0 5px 5px 0',
                        padding: '5px',
                        zIndex: zIndex + 1,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                    }}
                >
                    {contextMenuItems?.map((item, index) => (
                        <button
                            key={index}
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation(); // Prevent event bubbling
                                
                                console.log(`Context menu items id: ${contextMenuItemsId}`);

                                const normalizedContextMenuItemsId = typeof contextMenuItemsId === 'string' ? contextMenuItemsId.replace('-context-menu', '') : contextMenuItemsId;
                                
                                item.onClick(normalizedContextMenuItemsId);
                                setIsContextMenuOpen(false); // Close the context menu in parent
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px',
                                border: 'black 2px solid',
                                background: 'none',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {item.name} {/* Display item name */}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
};

export default ActionsContextMenu;