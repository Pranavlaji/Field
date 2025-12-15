import { useCardStore } from '../store/cardStore';
import type { Card } from '../types';

interface FontSizeControlProps {
    selectedCard: Card | null;
}

const FONT_SIZES = [12, 14, 18, 24, 32, 48];

export function FontSizeControl({ selectedCard }: FontSizeControlProps) {
    const updateFontSize = useCardStore((s) => s.updateCardFontSize);

    // Only show for selected text cards
    if (!selectedCard || selectedCard.type !== 'text') {
        return null;
    }

    const currentSize = selectedCard.fontSize || 14;

    const handleDecrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentIndex = FONT_SIZES.indexOf(currentSize);
        if (currentIndex > 0) {
            updateFontSize(selectedCard.id, FONT_SIZES[currentIndex - 1]);
        } else if (currentIndex === -1) {
            // Current size not in list, find closest smaller
            const smaller = FONT_SIZES.filter(s => s < currentSize);
            if (smaller.length > 0) {
                updateFontSize(selectedCard.id, smaller[smaller.length - 1]);
            }
        }
    };

    const handleIncrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentIndex = FONT_SIZES.indexOf(currentSize);
        if (currentIndex !== -1 && currentIndex < FONT_SIZES.length - 1) {
            updateFontSize(selectedCard.id, FONT_SIZES[currentIndex + 1]);
        } else if (currentIndex === -1) {
            // Current size not in list, find closest larger
            const larger = FONT_SIZES.filter(s => s > currentSize);
            if (larger.length > 0) {
                updateFontSize(selectedCard.id, larger[0]);
            }
        }
    };

    return (
        <div className="font-size-control">
            <button
                className="font-size-btn"
                onClick={handleDecrease}
                disabled={currentSize <= FONT_SIZES[0]}
            >
                −
            </button>
            <span className="font-size-value">{currentSize}</span>
            <button
                className="font-size-btn"
                onClick={handleIncrease}
                disabled={currentSize >= FONT_SIZES[FONT_SIZES.length - 1]}
            >
                +
            </button>
        </div>
    );
}
