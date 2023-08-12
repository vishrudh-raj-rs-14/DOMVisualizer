import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import "./Editor.css";

const Editor = ({
  activeNode,
  setActiveNode,
  htmlCode,
  setHtmlCode,
  cssCode,
  setCssCode,
}) => {
  const [code, setCode] = useState(cssCode);
  useEffect(() => {
    console.log(cssCode);
    setCode(cssCode);
  }, [htmlCode, cssCode]);
  useEffect(() => {
    console.log(code);
  }, [code]);

  if (!cssCode) {
    return <div className="editor">Choose a css file to view styles</div>;
  }
  if (!activeNode) {
    return <div className="editor">Select an element to view its styles</div>;
  }
  return (
    <div className="editor">
      <div className="element">
        <div className="element-name">{activeNode.node.tagName}</div>
        <div className="element-classes">
          {activeNode?.node?.classList?.map((ele, i) => {
            return <span key={i}>{ele}</span>;
          })}
        </div>
      </div>
      <div className="styles">
        <div className="style">
          <div className="style-header">STYLES</div>
          <div>
            <div className="style-cointainer">
              {activeNode.node?.classList?.map((ele) => {
                let cssProp =
                  cssCode[ele] || cssCode[`.${ele}`] || cssCode[`#${ele}`];
                if (cssProp) {
                  return (
                    <div className="style-class">
                      <div className="className">{ele}</div>
                      <div className="props">
                        {Object.entries(cssProp.styles).map((style) => {
                          return (
                            <div className="field-ele">
                              <div className="field">{style[0]} - </div>
                              <div className="prop">
                                <input
                                  value={style[1]}
                                  type="text"
                                  onChange={(e) => {
                                    setCssCode((oldCssCode) => {
                                      console.log(style);
                                      if (oldCssCode[ele]) {
                                      }
                                      let modProp =
                                        oldCssCode[ele] ||
                                        oldCssCode[`.${ele}`] ||
                                        oldCssCode[`#${ele}`];
                                      if (modProp) {
                                        modProp.styles[style[0]] =
                                          e.target.value;
                                      }
                                      console.log(oldCssCode);

                                      return JSON.parse(
                                        JSON.stringify(oldCssCode)
                                      );
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
