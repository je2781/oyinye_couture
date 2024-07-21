import ReactDOM from "react-dom";

const BackDrop = (props: any) => {
  return <div className='backdrop' onClick={props.onClick}></div>;
};

const QuickViewModalOverlay = (props: any) => {
  return (
    <main 
    className="modal shadow-2xl flex lg:flex-row flex-col items-center lg:h-[480px] h-[80vh] overflow-y-auto bg-white">
      {props.children}
    </main>
  );
};

const SearchModalOverlay = (props: any) => {
  return (
    <main 
    className="search-modal flex flex-row justify-center h-28 bg-white w-full py-7 fixed top-0 left-0 z-30">
      {props.children}
    </main>
  );
};

export const QuickViewModal = (props: any) => {
  return (
    <>
      {ReactDOM.createPortal(
        <BackDrop onClick={props.onClose}/>,
        document.getElementById("backdrop-root")!
      )}
      {ReactDOM.createPortal(
        <QuickViewModalOverlay>{props.children}</QuickViewModalOverlay>,
        document.getElementById("quick-view-modal")!
      )}
    </>
  );
};

export const SearchModal = (props: any) => {
  return (
    <>
      {ReactDOM.createPortal(
        <BackDrop onClick={props.onClose}/>,
        document.getElementById("backdrop-root")!
      )}
      {ReactDOM.createPortal(
        <SearchModalOverlay {...props}>{props.children}</SearchModalOverlay>,
        document.getElementById("search-modal")!
      )}
    </>
  );
};

