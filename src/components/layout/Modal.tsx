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

const FilterModalOverlay = (props: any) => {
  return (
    <main id='filter-settings' aria-orientation="vertical" aria-labelledby='toggle-settings' className="z-[45] w-4/5 flex-col pb-12 pt-[70px] px-4 bg-white gap-y-6 h-full flex fixed top-0 left-0">
      {props.children}
      <h2 className="font-serif text-lg text-gray-500 absolute left-4 top-5 italic font-extralight">Filter</h2>
      <i className="fa-solid fa-xmark text-xl absolute right-4 top-5 cursor-pointer text-gray-500" onClick={props.onClick}></i>
    </main>
  );
};

const ReviewsModalOverlay = (props: any) => {
  return (
    <main aria-orientation="vertical" id='reviews-form' style={{'--modal-pos-left': `${props.left}`, '--modal-width': `${props.width}`} as React.CSSProperties} aria-labelledby='toggle-button' className={`${props.classes} w-4/5 left-[10%] z-[50] fixed bottom-[1vh] top-[0.5vh]`}>
      {props.children}
      <i className="fa-solid fa-xmark text-xl absolute right-6 top-5 cursor-pointer text-gray-500" onClick={props.onClose}></i>
    </main>
  );
};

const AdminSettingsModalOverlay = (props: any) => {
  return (
    <main id='admin-settings-modal' aria-orientation="vertical" style={{'--modal-pos-left': `${props.left}`, '--modal-width': `${props.width}`} as React.CSSProperties} aria-labelledby='toggle-button' className={`${props.classes ? props.classes : 'bg-white px-4 h-fit'} z-[50] w-4/5 fixed top-[10vh] left-[10%]`}>
      {props.children}
      <i className="fa-solid fa-xmark text-xl absolute right-4 top-5 cursor-pointer text-gray-500" onClick={props.onClose}></i>
    </main>
  );
};

const MobileModalOverlay = (props: any) => {
  return (
    <main id='mobile-nav' aria-orientation="vertical" aria-labelledby='toggle-button' className={`${props.classes ? props.classes : 'bg-white px-4 pt-[70px]'} z-[45] w-4/5 flex-col pb-12 gap-y-6 h-full flex fixed top-0 left-0`}>
      {props.children}
      <i className="fa-solid fa-xmark text-xl absolute right-4 top-5 cursor-pointer text-gray-500" onClick={props.onClick}></i>
    </main>
  );
};

const SearchModalOverlay = (props: any) => {
  return (
    <main 
    className="search-modal flex flex-row justify-center h-28 bg-white w-full py-7 fixed top-0 left-0 z-[45]">
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

export const MobileModal = (props: any) => {
  return (
    <>
      {ReactDOM.createPortal(
        <BackDrop onClick={props.onClose}/>,
        document.getElementById("backdrop-root")!
      )}
      {ReactDOM.createPortal(
        <MobileModalOverlay onClick={props.onClose} classes={props.classes}>{props.children}</MobileModalOverlay>,
        document.getElementById("mobile-modal")!
      )}
    </>
  );
};

export const FilterModal = (props: any) => {
  return (
    <>
      {ReactDOM.createPortal(
        <BackDrop onClick={props.onClose}/>,
        document.getElementById("backdrop-root")!
      )}
      {ReactDOM.createPortal(
        <FilterModalOverlay onClick={props.onClose}>{props.children}</FilterModalOverlay>,
        document.getElementById("filter-modal")!
      )}
    </>
  );
};

export const ReviewsModal = (props: any) => {
  return (
    <>
      {ReactDOM.createPortal(
        <BackDrop onClick={props.onClose}/>,
        document.getElementById("backdrop-root")!
      )}
      {ReactDOM.createPortal(
        <ReviewsModalOverlay {...props}>{props.children}</ReviewsModalOverlay>,
        document.getElementById("reviews-modal")!
      )}
    </>
  );
};

export const AdminSettingsModal = (props: any) => {
  return (
    <>
      {ReactDOM.createPortal(
        <BackDrop onClick={props.onClose}/>,
        document.getElementById("backdrop-root")!
      )}
      {ReactDOM.createPortal(
        <AdminSettingsModalOverlay {...props}>{props.children}</AdminSettingsModalOverlay>,
        document.getElementById("admin-modal")!
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

