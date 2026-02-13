import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const PopOutWindow = ({ title, children, onClose }) => {
    const [container, setContainer] = useState(null);
    const [externalWindow, setExternalWindow] = useState(null);

    useEffect(() => {
        // Open new window
        const newWindow = window.open('', '', 'width=600,height=400,left=200,top=200');
        if (newWindow) {
            setExternalWindow(newWindow);
            const div = newWindow.document.createElement('div');
            newWindow.document.body.appendChild(div);
            newWindow.document.title = title;

            // Copy styles
            Array.from(document.styleSheets).forEach(styleSheet => {
                try {
                    if (styleSheet.cssRules) {
                        const newStyleElement = newWindow.document.createElement('style');
                        Array.from(styleSheet.cssRules).forEach(cssRule => {
                            newStyleElement.appendChild(newWindow.document.createTextNode(cssRule.cssText));
                        });
                        newWindow.document.head.appendChild(newStyleElement);
                    }
                } catch (e) { }
            });

            // Add dark mode classes
            newWindow.document.body.className = "bg-slate-900 text-white p-4";

            setContainer(div);

            newWindow.onbeforeunload = () => {
                onClose();
            };
        }

        return () => {
            if (newWindow) newWindow.close();
        };
    }, []);

    if (!container) return null;
    return createPortal(children, container);
};

export default PopOutWindow;
