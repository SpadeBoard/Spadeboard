import React, { useState, useCallback } from 'react';
import { FaEllipsisV, FaSync } from 'react-icons/fa';
import { ActionContextMenuItem } from './action-context-menu-item';

interface ActionsContextMenuProps {
    contextMenuItemsId: string;
    contextMenuItems?: ActionContextMenuItem[];
    isContextMenuOpen: boolean; // Prop to control visibility
    setIsContextMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ActionsContextMenu: React.FC<ActionsContextMenuProps> = ({
    contextMenuItemsId,
    contextMenuItems,
    isContextMenuOpen,
    setIsContextMenuOpen,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = useCallback(() => {
        setIsOpen(prev => !prev);
        setIsContextMenuOpen(prev => !prev); // Toggle the parent context menu state
    }, [setIsContextMenuOpen]);

    return (
        <div
            id={contextMenuItemsId}
            style={{
                position: 'absolute',
                left: '-40px',
                top: '0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <button
                onClick={handleToggle}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '5px',
                    color: isOpen ? '#007bff' : '#000',
                }}
            >
                <FaEllipsisV />
            </button>
            {/* Only show the context menu if isContextMenuOpen is true */}
            {isContextMenuOpen && isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        left: '100%',
                        top: '0',
                        height: '100%',
                        backgroundColor: 'white',
                        boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
                        borderRadius: '0 5px 5px 0',
                        padding: '5px',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    {contextMenuItems?.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                item.onClick();
                                setIsOpen(false);
                                setIsContextMenuOpen(false); // Close the context menu in parent
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {item.name === 'Flip' ? <FaSync style={{ marginRight: '10px' }} /> : null}
                            {item.name} {/* Display item name */}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActionsContextMenu;