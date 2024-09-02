import React, { useState, useEffect } from 'react';

interface DisplaceCardMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onDisplace: (srcDeckId: string | number, amount: number, destinationDeckId: string) => void;
    availableDecksIds: (string| number)[];
    currentDeckId: string | number;
}

const DisplaceCardMenu: React.FC<DisplaceCardMenuProps> = ({
    isOpen,
    onClose,
    onDisplace,
    availableDecksIds,
    currentDeckId
}) => {
    const [amount, setAmount] = useState<number>(1);
    const [destinationDeckId, setDestinationDeckId] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setAmount(1);
            setDestinationDeckId('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onDisplace(currentDeckId, amount, destinationDeckId);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                maxWidth: '300px',
                width: '100%',
            }}>
                <h2 style={{ marginTop: 0 }}>Displace Cards</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px' }}>
                            Number of cards to move:
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                            min="1"
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="destinationDeck" style={{ display: 'block', marginBottom: '5px' }}>
                            Destination Deck:
                        </label>
                        <select
                            id="destinationDeck"
                            value={destinationDeckId}
                            onChange={(e) => setDestinationDeckId(e.target.value)}
                            style={{ width: '100%', padding: '5px' }}
                        >
                            <option value="">Select a deck</option>
                            {availableDecksIds
                                .filter(deckId => deckId !== currentDeckId)
                                .map(deckId => (
                                    <option key={deckId} value={deckId}>
                                        {deckId}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button type="button" onClick={onClose} style={{ padding: '5px 10px' }}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!destinationDeckId}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: destinationDeckId ? '#4CAF50' : '#ccc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: destinationDeckId ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Displace
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DisplaceCardMenu;