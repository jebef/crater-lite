import { createPortal } from 'react-dom';

// modal for rendering popup outside normal DOM tree
export const Modal = ({ children }: { children: any }) => {
    return createPortal(children, document.body);
}