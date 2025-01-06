"use client";
import styles from "./page.module.scss";
import { Workbook, WorkbookInstance } from "@fortune-sheet/react";
import { Sheet, Op, Selection } from "@fortune-sheet/core";
// import { User } from "@clerk/nextjs/server";
import "@fortune-sheet/react/dist/index.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { socket } from "../../libs/socket";
import Header from "./components/Header";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function SheetPage() {
  const [data, setData] = useState<Sheet[]>();
  const [workbookname, setWorkbookname] = useState("");
  const [error] = useState(false);
  const { userId } = useAuth();
  const workbookRef = useRef<WorkbookInstance>(null);
  const lastSelection = useRef<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const { sheetId } = useParams();
  // const { username, userId } = useMemo(() => {
  //   const _userId = uuidv4();
  //   return { username: `User-${_userId.slice(0, 3)}`, userId: _userId };
  // }, []);
  // useEffect(() => {
  //   socket.emit("get-data");
  //   socket.on("message", (data) => {
  //     const msg = JSON.parse(data);
  //     if (msg.req === "getData") {
  //       setData(msg.data.map((d: any) => ({ id: d._id, ...d })));
  //     } else if (msg.req === "op") {
  //       workbookRef.current?.applyOp(msg.data);
  //     } else if (msg.req === "addPresences") {
  //       workbookRef.current?.addPresences(msg.data);
  //     } else if (msg.req === "removePresences") {
  //       workbookRef.current?.removePresences(msg.data);
  //     }
  //   });
  //   socket.on("error", () => {
  //     setError(true);
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    if (!socket) return;

    // socket.onAny((event, ...args) => {
    //   console.log(event, args);
    // });
    socket.on("new-user", (userId) => {
      setOnlineUsers((users) => [...users, userId]);
    });
    socket.on("remove-user", (userId) => {
      setOnlineUsers((users) => users.filter((u) => u !== userId));
    });

    socket.emit("join sheet", sheetId);

    socket.emit("get-data", sheetId);


    socket.on("message", (data) => {
      const msg = JSON.parse(data);
      console.log(msg);
      
      if (msg.req === "getData") {
        console.log("lemme cook", msg.data);
        // remove workbookid from each sheet
        setWorkbookname(msg.data.name);
        msg.data.worksheets.forEach((sheet: any) => {
          delete sheet.workbookId;
        });
        setData(msg.data.worksheets.map((d: any) => ({ id: d._id, ...d })));
      }
    });

    socket.on("updated-cell", (data) => {
      data = JSON.parse(data.toString());
      console.log("i am trying to update", data);
      workbookRef.current?.applyOp(data.data);
      // console.log(data);
    });

    socket.on("updated-sheet-name", (name) => {
      setWorkbookname(name);
    });


    return () => {
      socket.emit("leave server", userId);
      socket.off("new-user");
      socket.off("remove-user");
      socket.off("message");
      socket.off("updated-cell");
    };
  }, [userId, sheetId]);


  const onOp = (op: Op[]) => {
    if (!socket) return;
    console.log("op", op);
    socket.emit("op", sheetId, JSON.stringify({data: op}));
  }

  const onChange = useCallback((d: Sheet[]) => {
    setData(d);
  }, []);

  const afterSelectionChange = useCallback(
    (sheetId: string, selection: Selection) => {
      if (!socket) return;
      const s = { r: selection.row[0], c: selection.column[0] };
      if (
        lastSelection.current?.r === s.r &&
        lastSelection.current?.c === s.c
      ) {
        return;
      }
      lastSelection.current = s;
      // socket.emit(
      //   "addPresences",
      //   JSON.stringify({
      //     req: "addPresences",
      //     data: [
      //       {
      //         sheetId,
      //         username,
      //         userId,
      //         color: colors[Math.abs(hashCode(userId)) % colors.length],
      //         selection: s,
      //       },
      //     ],
      //   }),
      // );
    },
    // [userId, username],
    []
  );

  const onNameChange = async (name: string) => {
    setWorkbookname(name);
    socket.emit("update-sheet-name", sheetId, name);
  }

  if (error)
    return (
      <div style={{ padding: 16 }}>
        <p>Failed to connect to websocket server.</p>
        <p>
          {" "}
          Please note that this collabration demo connects to a local websocket
          server (ws://localhost:8081/ws).{" "}
        </p>
        <p>
          {" "}
          To make this work:
          <ol>
            <li>Clone the project</li>
            <li>Run server in backend-demo/: node index.js</li>
            <li>Make sure you also have mongodb running locally</li>{" "}
            <li>Try again</li>{" "}
          </ol>{" "}
        </p>{" "}
      </div>
    );
  if (!data) {
    return <div />;
  }
    return (
        <div className={styles.workbookcontainer}>
          <Header name={workbookname} users={onlineUsers.length} onChange={onNameChange} className={styles.header} />
          <div style={{flex: 1, display: "flex"}}>

          <Workbook
            ref={workbookRef}
            data={data}
            onChange={onChange}
            onOp={onOp}
            hooks = {{
              afterSelectionChange
            }}
            />
            </div>
            
        </div>
    );
}