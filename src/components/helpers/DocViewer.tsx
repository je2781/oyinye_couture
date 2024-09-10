import DocViewer, { DocViewerRenderers } from "react-doc-viewer";


const DocViewerComponent = ({file, classes }: any) => {
    const docs = [{ uri: URL.createObjectURL(file) }];
    return (
    <DocViewer
    pluginRenderers={DocViewerRenderers}
    documents={docs}
    style={{ height: '600px', width: '100%' }}
    className={classes}
         />
       );
    };
    export default DocViewerComponent;