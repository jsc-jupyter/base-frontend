import { Button, Modal } from 'react-bootstrap';

export type InputModalProps = {
  service: string;
  id: string;
};

export function InputModal({ service, id }: InputModalProps) {
  return (
    <Modal animation id={`${service}}-{id}-modal`}>
      <Modal.Dialog centered>
        <Modal.Header closeButton closeLabel="Close">
          <Modal.Title style={{ color: 'black' }}>Share Workshop</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: 'black' }}>Share your configuration</p>
          <a href="" target="_blank"></a>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-default" data-bs-dismiss="modal">
            Close
          </Button>
          <Button variant="outline-primary" id={`${service}-${id}-modal-copy-btn`}>
            Copy
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </Modal>
  );
}
