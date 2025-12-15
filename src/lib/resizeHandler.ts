export interface ResizeHandler {
    register: (element: HTMLElement, cardId: string) => void;
    unregister: (cardId: string) => void;
    setSelected: (cardId: string | null) => void;
    destroy: () => void;
}

export function createResizeHandler(
    onResizeEnd: (cardId: string, w: number, h: number) => void,
    getScale: () => number
): ResizeHandler {
    const registeredElements = new Map<string, HTMLElement>();
    const handleElements = new Map<string, HTMLElement>();
    let selectedCardId: string | null = null;

    let isResizing = false;
    let currentCardId: string | null = null;
    let currentElement: HTMLElement | null = null;
    let startX = 0;
    let startY = 0;
    let initialWidth = 0;
    let initialHeight = 0;

    function handleResizeStart(e: MouseEvent, cardId: string, cardElement: HTMLElement) {
        e.preventDefault();
        e.stopPropagation();

        isResizing = true;
        currentCardId = cardId;
        currentElement = cardElement;

        const scale = getScale();
        startX = e.clientX / scale;
        startY = e.clientY / scale;

        const rect = cardElement.getBoundingClientRect();
        initialWidth = rect.width / scale;
        initialHeight = rect.height / scale;

        cardElement.classList.add('is-resizing');
    }

    function handleMouseMove(e: MouseEvent) {
        if (!isResizing || !currentElement) return;

        const scale = getScale();
        const dx = e.clientX / scale - startX;
        const dy = e.clientY / scale - startY;

        // Bottom-right resize: grow/shrink from top-left anchor
        const newWidth = Math.max(60, initialWidth + dx);
        const newHeight = Math.max(30, initialHeight + dy);

        // Direct DOM manipulation
        currentElement.style.width = `${newWidth}px`;
        currentElement.style.height = `${newHeight}px`;
    }

    function handleMouseUp() {
        if (!isResizing || !currentElement || !currentCardId) return;

        currentElement.classList.remove('is-resizing');

        // Get final size
        const rect = currentElement.getBoundingClientRect();
        const scale = getScale();
        const w = rect.width / scale;
        const h = rect.height / scale;

        // Commit to store
        onResizeEnd(currentCardId, w, h);

        isResizing = false;
        currentCardId = null;
        currentElement = null;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    function updateHandleVisibility(cardId: string) {
        const handle = handleElements.get(cardId);
        if (handle) {
            const isSelected = cardId === selectedCardId;
            handle.style.display = isSelected ? 'block' : 'none';
        }
    }

    function register(cardElement: HTMLElement, cardId: string) {
        // Create single resize handle at bottom-right
        const handle = document.createElement('div');
        handle.className = 'resize-handle';

        const handler = (e: MouseEvent) => handleResizeStart(e, cardId, cardElement);
        handle.addEventListener('mousedown', handler);
        (handle as any).__resizeHandler = handler;

        cardElement.appendChild(handle);
        handleElements.set(cardId, handle);
        registeredElements.set(cardId, cardElement);

        // Initially hidden
        handle.style.display = 'none';
    }

    function unregister(cardId: string) {
        const handle = handleElements.get(cardId);
        if (handle) {
            const handler = (handle as any).__resizeHandler;
            if (handler) {
                handle.removeEventListener('mousedown', handler);
            }
            handle.remove();
            handleElements.delete(cardId);
        }
        registeredElements.delete(cardId);
    }

    function setSelected(cardId: string | null) {
        const previousId = selectedCardId;
        selectedCardId = cardId;

        if (previousId) updateHandleVisibility(previousId);
        if (cardId) updateHandleVisibility(cardId);
    }

    return {
        register,
        unregister,
        setSelected,
        destroy: () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            handleElements.forEach((handle) => handle.remove());
            handleElements.clear();
            registeredElements.clear();
        },
    };
}
