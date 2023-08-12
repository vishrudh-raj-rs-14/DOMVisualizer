import React, { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import Add from "../assets/add-button.png";
import Remove from "../assets/minus-button.png";
import "./canvasStyles.css";

function breadthFirstSearch(root, target) {
  const queue = [root];
  const visited = new Set();

  while (queue.length > 0) {
    const node = queue.shift();

    if (node === target) {
      return true;
    }

    visited.add(node);

    if (typeof node === "object" && node !== null) {
      for (const key in node) {
        if (!visited.has(node[key])) {
          queue.push(node[key]);
        }
      }
    }
  }

  return false;
}

function spreadNumbersAroundZero(count, gap) {
  const result = [];
  const halfCount = Math.floor(count / 2);
  if (count % 2 == 0) {
    let start = -1 * (halfCount - 1) * gap - 0.5 * gap;
    for (let i = 0; i < count; i++) {
      result.push(start + i * gap);
    }
  } else {
    let start = -1 * halfCount * gap;
    for (let i = 0; i < count; i++) {
      result.push(start + i * gap);
    }
  }
  return result;
}

class Node {
  constructor(x, y, width, height, text, node, connectTo = []) {
    this.x = x;
    this.y = y;
    this.node = node;
    this.text = text;
    this.width = width;
    this.connectTo = connectTo;
    this.height = height;
  }

  draw(ctx, canvas) {
    if (this.connectTo.length) {
      ctx.moveTo(this.connectTo[0], this.connectTo[1]);
      ctx.beginPath();
      ctx.moveTo(this.connectTo[0], this.connectTo[1]);
      ctx.lineTo(this.x + this.width / 2, this.y);
      ctx.strokeStyle = "white";
      ctx.stroke();
      ctx.closePath();
    }
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "15px Montserrat";
    ctx.textAlign = "center";
    ctx.fillText(
      this.text,
      this.x + this.width / 2,
      this.y + this.height / 2 + 5
    );
  }
}

class Tree {
  constructor(tree) {
    this.tree = tree;
    this.nodes = [];
    this.nodeWidth = 50;
    this.nodeHeight = 20;
  }

  draw(ctx, canvas, offset = [0, 0]) {
    ctx.save();
    ctx.translate(offset[0], offset[1]);
    this.nodes.forEach((ele) => {
      ele.draw(ctx, canvas);
    });
    ctx.restore();
  }
  createNode(x, y, text, nodeEle, connectTo = []) {
    const node = new Node(
      x,
      y,
      this.nodeWidth,
      this.nodeHeight,
      text,
      nodeEle,
      connectTo
    );
    this.nodes.push(node);
  }

  buildTree(curX, curY, tree, parentCoords = []) {
    if (tree) {
      const node = this.createNode(
        curX,
        curY,
        tree.tagName,
        tree,
        parentCoords
      );
      tree.children = tree.children.filter((value) => value !== undefined);
      for (let i = 0; i < tree.children.length; i++) {
        if (tree.children[i]) {
          const coords = spreadNumbersAroundZero(
            tree.children.length,
            120 + this.nodeWidth
          );
          if (tree.children.length) {
            // console.log(coords, tree);
            this.buildTree(curX + coords[i], curY + 50, tree.children[i], [
              curX + this.nodeWidth / 2,
              curY + this.nodeHeight,
            ]);
          } else {
            this.buildTree(curX + coords[i], curY + 50, tree.children[i], []);
          }
        }
      }
    }
  }
}

//[-60, 0, 60] [-30,30]

const CanvasVisualizer = ({
  htmlCode,
  setHtmlCode,
  activeNode,
  setActiveNode,
}) => {
  const canvasRef = useRef(null);
  let offset = [0, 0];
  const [lastOffset, setLastOffset] = useState([0, 0]);
  const draw = (ctx, frameCount, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  useEffect(() => {
    console.log(activeNode);
  }, [activeNode]);
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = (window.innerWidth * 2) / 3;
    canvas.height = window.innerHeight;
    let animationFrameId;
    let timeOut;
    let frameCount = 0;
    let fps = 60;
    let isDragging = false;
    const context = canvas.getContext("2d");
    const tree = new Tree(htmlCode);
    tree.buildTree(canvas.width / 2, 30, htmlCode);
    let lastX;
    let lastY;
    let offsetclone = [0, 0];
    canvas.addEventListener("click", (e) => {
      let coordX = e.clientX - canvas.getBoundingClientRect().x - offset[0];
      let coordY = e.clientY - canvas.getBoundingClientRect().y - offset[1];
      for (const ele of tree.nodes) {
        if (
          coordX > ele.x &&
          coordX < ele.x + ele.width &&
          coordY > ele.y &&
          coordY < ele.y + ele.height
        ) {
          setActiveNode(ele);
          break;
        }
      }
    });
    canvas.addEventListener("mousedown", (e) => {
      let coordX = e.clientX - canvas.getBoundingClientRect().x;
      let coordY = e.clientY - canvas.getBoundingClientRect().y;
      let coordXdup = e.clientX - canvas.getBoundingClientRect().x - offset[0];
      let coordYdup = e.clientY - canvas.getBoundingClientRect().y - offset[1];
      for (const ele of tree.nodes) {
        if (
          coordXdup > ele.x &&
          coordXdup < ele.x + ele.width &&
          coordYdup > ele.y &&
          coordYdup < ele.y + ele.height
        ) {
          return;
        }
      }
      lastX = coordX;
      lastY = coordY;
      isDragging = true;
      canvas.style.cursor = "grabbing";
    });
    canvas.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      //   console.log(deltaX, deltaY);
      offset = [deltaX + offsetclone[0], deltaY + offsetclone[1]];
    });
    canvas.addEventListener("mouseup", (e) => {
      isDragging = false;
      offsetclone = [...offset];
    });

    const render = () => {
      frameCount++;
      draw(context, frameCount, canvas);
      tree.draw(context, canvas, offset);
      timeOut = setTimeout(() => {
        animationFrameId = window.requestAnimationFrame(render);
      }, 1000 / fps);
    };
    render();

    return () => {
      clearTimeout(timeOut);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [htmlCode]);
  return (
    <div className="canvas-holder">
      <canvas ref={canvasRef}></canvas>
      {htmlCode ? (
        <>
          <div
            className="add-node"
            onClick={(e) => {
              const element = {
                tagName: "DIV",
                children: [],
                id: uniqid(),
                classList: ["div"],
              };
              activeNode.node.children.push(element);
              setHtmlCode(JSON.parse(JSON.stringify(htmlCode)));
              setActiveNode(undefined);
            }}
          >
            <img src={Add} />
          </div>
          <div
            className="remove-node"
            onClick={(e) => {
              setHtmlCode((tree) => {
                for (let i = 0; i < tree.children.length; i++) {}
              });
            }}
          >
            <img src={Remove} />
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default CanvasVisualizer;
