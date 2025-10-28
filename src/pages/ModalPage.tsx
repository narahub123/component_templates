import { useRef, useState } from "react";
import { Modal, ModalStackProvider } from "../ui";

export const ModalPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNestedOpen, setIsNestedOpen] = useState(false);
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const nestedActionRef = useRef<HTMLButtonElement>(null);

  return (
    <ModalStackProvider>
      <div className="appContainer">
        <header className="appHeader">
          <h1>Modal Playground</h1>
          <p>
            Toggle the base modal and explore its layout, focus handling, and
            scrolling behaviour.
          </p>
        </header>

        <button
          type="button"
          className="openButton"
          onClick={() => setIsOpen(true)}
        >
          Open modal
        </button>

        <Modal
          open={isOpen}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setIsNestedOpen(false);
            }
            setIsOpen(nextOpen);
          }}
          hasOverlay
          initialFocusRef={primaryActionRef}
        >
          <Modal.Header>
            <h2>Team update</h2>
            <Modal.CloseButton aria-label="Close team update modal" />
          </Modal.Header>
          <Modal.Body>
            <p>
              This base modal is built with a compound component API so that
              different variants can layer on top without duplicating logic.
            </p>
            <p>
              Use the header and footer slots for persistent actions, while the
              body can scroll independently of the sticky sections.
            </p>
            <button
              type="button"
              className="secondaryButton"
              onClick={() => setIsNestedOpen(true)}
            >
              Open nested modal
            </button>
            <ul>
              <li>
                Responsive: desktop centres the dialog, mobile covers the
                viewport.
              </li>
              <li>Focus trapping with optional initial focus overrides.</li>
              <li>
                Overlay, ESC, and outside click behaviours are configurable.
              </li>
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              className="secondaryButton"
              onClick={() => {
                setIsNestedOpen(false);
                setIsOpen(false);
              }}
            >
              Dismiss
            </button>
            <button
              type="button"
              className="primaryButton"
              ref={primaryActionRef}
              onClick={() => {
                setIsNestedOpen(false);
                setIsOpen(false);
              }}
            >
              Mark as read
            </button>
          </Modal.Footer>

          {isNestedOpen ? (
            <Modal
              open={isNestedOpen}
              onOpenChange={setIsNestedOpen}
              hasOverlay
              initialFocusRef={nestedActionRef}
              trapFocus
              width={"50vw"}
            >
              <Modal.Header>
                <h2>Nested modal</h2>
                <Modal.CloseButton aria-label="Close nested modal" />
              </Modal.Header>
              <Modal.Body>
                <p>This modal is stacked on top of the parent modal.</p>
              </Modal.Body>
              <Modal.Footer>
                <button
                  type="button"
                  className="primaryButton"
                  ref={nestedActionRef}
                  onClick={() => setIsNestedOpen(false)}
                >
                  Close nested modal
                </button>
              </Modal.Footer>
            </Modal>
          ) : null}
        </Modal>
      </div>
    </ModalStackProvider>
  );
};
