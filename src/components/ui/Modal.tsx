import ReactDOM from "react-dom";

const BackDrop = (props: any) => {
  return <div className='backdrop' onClick={props.onClick}></div>;
};

const ModalOverlay = (props: any) => {
  return (
    <div className="modal shadow-2xl flex lg:flex-row flex-col items-center lg:h-[480px] h-[70vh]">
      {props.children}
    </div>
  );
};

const Modal = (props: any) => {
  return (
    <>
      {ReactDOM.createPortal(
        <BackDrop onClick={props.onClose}/>,
        document.getElementById("backdrop-root")!
      )}
      {ReactDOM.createPortal(
        <ModalOverlay>{props.children}</ModalOverlay>,
        document.getElementById("modal-root")!
      )}
    </>
  );
};

export default Modal;
