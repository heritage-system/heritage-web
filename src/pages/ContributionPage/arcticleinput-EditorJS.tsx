import React, { useEffect, useRef, useState } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Paragraph from "@editorjs/paragraph"
import Header from "@editorjs/header"
import List from "@editorjs/list"
import Embed from "@editorjs/embed"
import Underline from "@editorjs/underline"
import ImageTool from "@editorjs/image";
// import Marker from "@editorjs/marker"
// import ColorPlugin from "editorjs-text-color-plugin"


const DEFAULT_INITIAL_DATA: OutputData = {
  time: new Date().getTime(),
  blocks: [
    {
      type: "header",
      data: {
        text: "This is my awesome editor!",
        level: 1,
      },
    },
    {
      type: "paragraph",
      data: {
        text: "Nội dung này sẽ hiển thị lại ở dưới 👇",
      },
    },
  ],
};

const HeritageEditor = () => {
  const ejInstance = useRef<EditorJS | null>(null);
  const [content, setContent] = useState<OutputData | null>(null);

  const initEditor = () => {
    const editor = new EditorJS({
      holder: "editorjs",
      placeholder: "Let's take a note!",
      tools: {
        textAlignment: {
          // @ts-ignore
          class: AlignmentBlockTune,
          config: {
            default: "left",
            blocks: {
              header: "center",
            },
          },
        },
        paragraph: {
          class: Paragraph as any ,
          tunes: ["textAlignment"],
        },
        header: {
          class: Header  as any,
          inlineToolbar: true,
          tunes: ["textAlignment"],
          config: {
            placeholder: "Enter a Header",
            levels: [1, 2, 3, 4, 5],
            defaultLevel: 2,
          },
        },
       
        list: {
          class: List  as any,
          config: {
            defaultStyle: "unordered",
          },
        },
       
        image: {
    class: ImageTool,
    config: {
      endpoints: {
        //byFile: "/uploadFile", // API upload file
        byUrl: "/fetchUrl",    // API fetch từ URL
      },
    },
  },
        embed: {
          class: Embed as any,
          config: {
            services: {
              youtube: true,
              codepen: true,
            },
          },
        },
        underline: { class: Underline },      
        //Marker: { class: Marker },     
        changeCase: {
          // @ts-ignore
          class: ChangeCase,
        },
        Color: {
          // @ts-ignore
          class: ColorPlugin,
          config: {
            colorCollections: [
              "#EC7878",
              "#9C27B0",
              "#673AB7",
              "#3F51B5",
              "#0070FF",
              "#03A9F4",
              "#00BCD4",
              "#4CAF50",
              "#8BC34A",
              "#CDDC39",
              "#FFF",
            ],
            defaultColor: "#FF1300",
            customPicker: true,
          },
        },
      },
      autofocus: true,
    });

    ejInstance.current = editor;
  };

  useEffect(() => {
    if (!ejInstance.current) {
      initEditor();
    }
    return () => {
      ejInstance.current?.destroy();
      ejInstance.current = null;
    };
  }, []);

  // 👉 Hàm chuyển JSON EditorJS thành HTML
  const renderBlocks = (data: OutputData | null) => {
    if (!data) return <p>Chưa có dữ liệu</p>;

    return data.blocks.map((block, index) => {
      switch (block.type) {
        case "header":
  const Tag = (`h${block.data.level}` as keyof React.JSX.IntrinsicElements);
  const Heading = Tag as React.ElementType;
  return <Heading key={index}>{block.data.text}</Heading>;


        case "paragraph":
          return <p key={index}>{block.data.text}</p>;

        case "list":
          return block.data.style === "ordered" ? (
            <ol key={index}>
              {block.data.items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          ) : (
            <ul key={index}>
              {block.data.items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );

        case "quote":
          return (
            <blockquote key={index}>
              <p>{block.data.text}</p>
              <cite>{block.data.caption}</cite>
            </blockquote>
          );

        case "checklist":
          return (
            <ul key={index}>
              {block.data.items.map((item: any, i: number) => (
                <li key={i}>
                  <input type="checkbox" checked={item.checked} readOnly />{" "}
                  {item.text}
                </li>
              ))}
            </ul>
          );

        case "table":
          return (
            <table key={index} border={1}>
              <tbody>
                {block.data.content.map((row: string[], r: number) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );

        case "code":
          return (
            <pre key={index}>
              <code>{block.data.code}</code>
            </pre>
          );

          case "image":
  return (
    <img
      key={index}
      src={block.data.file?.url || block.data.url}
      alt={block.data.caption || ""}
      className="max-w-full"
    />
  );

case "video":
  return (
    <iframe
      key={index}
      width="560"
      height="315"
      src={block.data.url}
      title="Video"
      frameBorder="0"
      allowFullScreen
    ></iframe>
  );


        default:
          return <p key={index}>❓ Unsupported block: {block.type}</p>;
      }
    });
  };

  return (
    <div>
      {/* Khung Editor */}
      <div id="editorjs" className="border p-2 min-h-[200px]"></div>

      {/* Hiển thị preview nội dung */}
      <div className="mt-4 p-2 border bg-gray-50">
        <h2 className="text-lg font-bold">Preview:</h2>
        <div className="prose">{renderBlocks(content)}</div>
      </div>
    </div>
  );
};

export default HeritageEditor;
