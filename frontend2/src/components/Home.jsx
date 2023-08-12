import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import downloadImg from "../assets/download.png";
import CanvasVisualizer from "./CanvasVisualizer";
import Editor from "./Editor";
import FileSaver from "file-saver";
import uniqid from "uniqid";

function buildTree(node) {
  const ignoreList = ["LINK", "META"];

  const tree = {
    tagName: node.tagName,
    classList: node.className
      ? [...node.className?.split(" "), node?.tagName?.toLowerCase()]
      : [node?.tagName?.toLowerCase()],
    id: uniqid(),

    children: [],
  };
  if (node.id) {
    tree.classList.push(node.id);
  }
  if (ignoreList.includes(tree.tagName)) {
    return;
  }

  // if (node.tagName == "TITLE") {
  //   console.log(node.childNodes[0].nodeType);
  // }
  // if (node.nodeType == 3) {
  //   tree.value = node.textContent;
  // }

  for (const childNode of node.childNodes) {
    if (childNode.nodeType === Node.ELEMENT_NODE) {
      tree.children.push(buildTree(childNode));
    }
  }

  return tree;
}
function convertCssToObject(cssText) {
  const classes = {};
  const styleTags = cssText.match(/([.#]?[\w-]+)\s*{([^}]*)}/g);

  if (styleTags) {
    styleTags.forEach((styleTag) => {
      const [, selector, styleString] = styleTag.match(
        /([.#]?[\w-]+)\s*{([^}]*)}/
      );
      const styleObject = {};

      let selectorType;
      if (selector.startsWith(".")) {
        selectorType = "class";
      } else if (selector.startsWith("#")) {
        selectorType = "id";
      } else {
        selectorType = "element";
      }

      styleString.split(";").forEach((styleDeclaration) => {
        const [property, value] = styleDeclaration.trim().split(":");
        if (property && value) {
          styleObject[property.trim()] = value.trim();
        }
      });

      classes[selector] = {
        type: selectorType,
        styles: styleObject,
      };
    });
  }

  return classes;
}

const Home = () => {
  const [htmlFile, setHtmlFile] = useState();
  const [cssFile, setCssFile] = useState();

  const [htmlCode, setHtmlCode] = useState(undefined);
  const [cssCode, setCssCode] = useState(undefined);
  const [activeNode, setActiveNode] = useState();
  const canvasRef = useRef(null);

  const handleHTMLFileChange = (e) => {
    console.log(e.target.files);
    if (e.target.files) {
      setHtmlFile(e.target.files[0]);
      console.log(e.target.files);
    }
  };

  const handleCSSFileChange = (e) => {
    if (e.target.files) {
      setCssFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const reader = new FileReader();
    if (!htmlFile) {
      setHtmlCode(undefined);
    } else {
      reader.onload = function (event) {
        const fileContent = event.target.result;
        const parser = new DOMParser();
        const doc = parser.parseFromString(fileContent, "text/html");
        const tree = buildTree(doc);
        console.log(tree.children[0]);
        setHtmlCode(tree.children[0]);
      };
      reader.readAsText(htmlFile);
    }
  }, [htmlFile]);
  useEffect(() => {
    const reader = new FileReader();
    if (!cssFile) {
      setCssCode(undefined);
    } else {
      reader.onload = function (event) {
        const fileContent = event.target.result;
        const doc = convertCssToObject(fileContent);
        // const tree = buildTree(doc);
        setCssCode(doc);
      };
      reader.readAsText(cssFile);
    }
  }, [cssFile]);

  return (
    <div className="body">
      Input HTML File
      <input type="file" onChange={handleHTMLFileChange} />
      Input Css File
      <input type="file" onChange={handleCSSFileChange} />
      {/* <div>{code}</div> */}
      <div className="visualiserCointainer">
        <CanvasVisualizer
          htmlCode={htmlCode}
          setHtmlCode={setHtmlCode}
          activeNode={activeNode}
          setActiveNode={setActiveNode}
        />
        <Editor
          activeNode={activeNode}
          setActiveNode={setActiveNode}
          htmlCode={htmlCode}
          setHtmlCode={setHtmlCode}
          cssCode={cssCode}
          setCssCode={setCssCode}
        />
      </div>
      {cssCode ? (
        <div
          className="download-btn"
          onClick={(e) => {
            const cssText = Object.keys(cssCode)
              .map((selector) => {
                const rules = cssCode[selector];
                const ruleText = Object.keys(rules.styles)
                  .map((property) => `${property}: ${rules.styles[property]};`)
                  .join(" ");
                return `${selector} { ${ruleText} }`;
              })
              .join("\n");
            const file = new Blob([cssText], { type: "text/css" });
            FileSaver.saveAs(file, `style-${Date.now()}.css`);
          }}
        >
          <img src={downloadImg} />
        </div>
      ) : (
        ""
      )}
      {/* <div
        className="download-btn"
        onClick={(e) => {
          const cssText = Object.keys(cssCode)
            .map((selector) => {
              const rules = cssCode[selector];
              const ruleText = Object.keys(rules)
                .map((property) => `${property}: ${rules[property]};`)
                .join(" ");
              return `${selector} { ${ruleText} }`;
            })
            .join("\n");
        }}
      >
        <img src={downloadImg} />
      </div> */}
    </div>
  );
};

export default Home;
