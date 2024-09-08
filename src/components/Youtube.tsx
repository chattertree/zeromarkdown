import {
  usePublisher,
  DirectiveDescriptor,
  DialogButton,
  insertDirective$,
} from "@mdxeditor/editor";
import { FaYoutube } from "react-icons/fa";

export const YoutubeDirectiveDescriptor: DirectiveDescriptor = {
  name: "youtube",
  type: "leafDirective",
  testNode(node) {
    return node.name === "youtube";
  },
  attributes: ["id"],
  hasChildren: false,
  Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <button
          onClick={() => {
            parentEditor.update(() => {
              lexicalNode.selectNext();
              lexicalNode.remove();
            });
          }}
        >
          delete
        </button>
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${mdastNode.attributes?.id}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
      </div>
    );
  },
};

export const YouTubeButton = () => {
  const insertDirective: any = usePublisher(insertDirective$);

  return (
    <DialogButton
      tooltipTitle="Insert Youtube video"
      submitButtonTitle="Insert video"
      dialogInputPlaceholder="Paste the youtube video URL"
      buttonContent={<FaYoutube />}
      onSubmit={(url) => {
        const videoId = new URL(url).searchParams.get("v");
        if (videoId) {
          insertDirective({
            name: "youtube",
            type: "leafDirective",

            attributes: { id: videoId },
            children: [],
          });
        } else {
          alert("Invalid YouTube URL");
        }
      }}
    />
  );
};
