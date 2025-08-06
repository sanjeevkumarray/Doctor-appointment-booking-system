import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content">
          <Dialog.Title className="modal-title">{title}</Dialog.Title>
          <Dialog.Close className="modal-close">
            <X />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
